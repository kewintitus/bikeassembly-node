const jwt = require('jsonwebtoken');
const BikeRecord = require('../models/bikeRecordModel');

exports.createBikeRecord = async (req, res, next) => {
  try {
    const body = req.body;
    const token = req.cookies.jwt;
    let userData;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(200).json({ loggedIn: false });
      }
      userData = decoded;
    });
    const currentTime = new Date();
    const endTime = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
      currentTime.getHours(),
      currentTime.getMinutes() + body?.duration,
      currentTime.getSeconds(),
      currentTime.getMilliseconds()
    );
    console.log(body);
    console.log(userData);
    console.log(currentTime.toISOString(), endTime.toISOString());
    const record = await BikeRecord.create({
      bikeType: body?.bikeType,
      bikeName: body?.bikeName,
      duration: body?.duration,
      startedAt: currentTime.toISOString(),
      endsAt: endTime.toISOString(),
      username: userData?.username,
      isCancelled: false,
    });

    res.status(200).json({ status: 'success', savedRecord: record });
  } catch (error) {
    res
      .status(500)
      .json({ status: 'FAILED', message: 'Unable to build bike', error });
  }
};

exports.getBikeRecords = async (req, res, next) => {
  try {
    const query = req.query;
    const token = req.cookies.jwt;
    let userData;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(200).json({ loggedIn: false });
      }
      userData = decoded;
    });
    let fetchedData;
    console.log(userData, query);
    if (query?.type === 'userRecords') {
      fetchedData = await BikeRecord.aggregate(
        [
          { $match: { username: userData?.username } },
          {
            $addFields: {
              status: {
                $cond: {
                  if: '$isCancelled',
                  then: 'Cancelled',
                  else: {
                    $cond: {
                      if: {
                        $lt: ['$$NOW', { $toDate: '$endsAt' }],
                      },
                      then: 'In Progress',
                      else: 'Completed',
                    },
                  },
                },
              },
            },
          },
          { $sort: { startedAt: -1 } },
        ],
        { maxTimeMS: 60000, allowDiskUse: true }
      );
    }
    console.log(fetchedData);
    res.status(200).json({ status: 'SUCCESS', data: fetchedData });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: 'FAILED', message: 'unknown error occured' });
  }
};

exports.updateBikeRecord = async (req, res, next) => {
  try {
    const body = req.body;
    const token = req.cookies.jwt;
    let userData;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(200).json({ loggedIn: false });
      }
      userData = decoded;
    });
    let updatedData;
    console.log(body);
    if (body.type == 'cancelBuild') {
      updatedData = await BikeRecord.findByIdAndUpdate(body.id, {
        isCancelled: true,
        timeElapsedBeforeCancel: new Date().toISOString(),
      });
    }
    res.status(200).json({ status: 'Success', data: updatedData });
  } catch (error) {
    res
      .status(500)
      .json({ status: 'FAILED', message: 'Unable to cancel', error });
  }
};

exports.getAllBikeRecords = async (req, res, next) => {
  try {
    const query = req.query;
    const token = req.cookies.jwt;
    let userData;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(200).json({ loggedIn: false });
      }
      userData = decoded;
    });
    let fetchedData;

    if (query?.type == 'overallCompletedBikeTypeCount') {
      if (!query.from || !query.to)
        return res
          .status(401)
          .json({ status: 'Failed', message: 'Wrong paramaeters' });
      const res = await BikeRecord.aggregate([
        {
          $match: {
            $and: [
              {
                startedAt: {
                  $gte: `${query.from}`,
                },
              },
              {
                endsAt: {
                  $lte: `${query.to}`,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            status: {
              $cond: {
                if: '$isCancelled',
                then: 'Cancelled',
                else: {
                  $cond: {
                    if: {
                      $lt: [
                        '$$NOW',
                        {
                          $toDate: '$endsAt',
                        },
                      ],
                    },
                    then: 'In Progress',
                    else: 'Completed',
                  },
                },
              },
            },
          },
        },
        {
          $match: {
            status: 'Completed',
          },
        },
        {
          $group: {
            _id: '$bikeType',
            count: {
              $count: {},
            },
          },
        },
      ]);
      fetchedData = res;

      //   console.log(res);
    } else if (query?.type == 'overallEmployeeContribution') {
      if (!query.from || !query.to)
        return res
          .status(401)
          .json({ status: 'Failed', message: 'Wrong paramaeters' });

      const res = await BikeRecord.aggregate([
        {
          $match: {
            $and: [
              {
                startedAt: {
                  $gt: `${query.from}`,
                },
              },
              {
                endsAt: {
                  $lte: `${query.to}`,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            status: {
              $cond: {
                if: '$isCancelled',
                then: 'Cancelled',
                else: {
                  $cond: {
                    if: {
                      $lt: [
                        '$$NOW',
                        {
                          $toDate: '$endsAt',
                        },
                      ],
                    },
                    then: 'In Progress',
                    else: 'Completed',
                  },
                },
              },
            },
          },
        },
        {
          $match: {
            status: 'Completed',
          },
        },
        {
          $group: {
            _id: '$username',
            count: {
              $count: {},
            },
          },
        },
      ]);
      fetchedData = res;
    } else if (query?.type == 'bikeTypeProductionTrend') {
      if (!query.from || !query.to)
        return res
          .status(401)
          .json({ status: 'Failed', message: 'Wrong paramaeters' });

      const res = await BikeRecord.aggregate([
        {
          $match: {
            $and: [
              {
                endsAt: {
                  $gt: `${query?.from}`,
                },
              },
              {
                endsAt: {
                  $lte: `${query?.to}`,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            status: {
              $cond: {
                if: '$isCancelled',
                then: 'Cancelled',
                else: {
                  $cond: {
                    if: {
                      $lt: [
                        '$$NOW',
                        {
                          $toDate: '$endsAt',
                        },
                      ],
                    },
                    then: 'In Progress',
                    else: 'Completed',
                  },
                },
              },
            },
          },
        },
        {
          $match: {
            status: 'Completed',
          },
        },
        {
          $addFields: {
            endsAtDate: {
              $dateFromString: {
                dateString: '$endsAt',
              },
            },
          },
        },
        {
          $addFields: {
            completedDay: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$endsAtDate',
                timezone: 'UTC',
              },
            },
          },
        },
        {
          $group: {
            _id: {
              completedDay: '$completedDay',
              bikeType: '$bikeType',
            },
            count: {
              $count: {},
            },
          },
        },
      ]);
      fetchedData = res;
    } else if (query?.type == 'mostProducedBike') {
      if (!query.from || !query.to)
        return res
          .status(401)
          .json({ status: 'Failed', message: 'Wrong paramaeters' });

      const data = await BikeRecord.aggregate([
        {
          $match: {
            $and: [
              {
                endsAt: {
                  $gt: `${query?.from}`,
                },
              },
              {
                endsAt: {
                  $lte: `${query?.to}`,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            status: {
              $cond: {
                if: '$isCancelled',
                then: 'Cancelled',
                else: {
                  $cond: {
                    if: {
                      $lt: [
                        '$$NOW',
                        {
                          $toDate: '$endsAt',
                        },
                      ],
                    },
                    then: 'In Progress',
                    else: 'Completed',
                  },
                },
              },
            },
          },
        },
        {
          $match: {
            status: 'Completed',
          },
        },
        {
          $group: {
            _id: '$bikeType',
            count: {
              $count: {},
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
        {
          $limit: 1,
        },
      ]);
      fetchedData = data;
      console.log(data);
    } else if (query?.type == 'mostProductiveEmployee') {
      if (!query.from || !query.to)
        return res
          .status(401)
          .json({ status: 'Failed', message: 'Wrong paramaeters' });

      const data = await BikeRecord.aggregate([
        {
          $match: {
            $and: [
              {
                endsAt: {
                  $gt: `${query?.from}`,
                },
              },
              {
                endsAt: {
                  $lte: `${query?.to}`,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            status: {
              $cond: {
                if: '$isCancelled',
                then: 'Cancelled',
                else: {
                  $cond: {
                    if: {
                      $lt: [
                        '$$NOW',
                        {
                          $toDate: '$endsAt',
                        },
                      ],
                    },
                    then: 'In Progress',
                    else: 'Completed',
                  },
                },
              },
            },
          },
        },
        {
          $match: {
            status: 'Completed',
          },
        },
        {
          $group: {
            _id: '$username',
            count: {
              $count: {},
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
        {
          $limit: 1,
        },
      ]);
      fetchedData = data;
      console.log(data);
    }

    res.status(200).json({ status: 'SUCCESS', data: fetchedData });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: 'FAILED', message: 'Unable fetch data', error });
  }
};

exports.isAdmin = (req, res, next) => {
  const token = req.cookies.jwt;
  let userData;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(200).json({ loggedIn: false });
    }
    userData = decoded;
  });
  if (userData?.role !== 'admin') {
    return res.status(401).json({ message: 'Access Denied!!' });
  }
  console.log('Hello from middleware', userData);
  next();
};
