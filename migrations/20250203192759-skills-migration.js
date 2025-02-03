module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const now = new Date();
    await db.collection('skills').insertMany([
      {
        skillName: "Javascript",
        status: "active",
        createdAt: now,
        updatedAt: now,
        "__v": 0
      },
      {
        skillName: "Python",
        status: "active",
        createdAt: now,
        updatedAt: now,
        "__v": 0
      },
      {
        skillName: "Java",
        status: "active",
        createdAt: now,
        updatedAt: now,
        "__v": 0
      },
      {
        skillName: "C++",
        status: "active",
        createdAt: now,
        updatedAt: now,
        "__v": 0
      },
      {
        skillName: "C#",
        status: "active",
        createdAt: now,
        updatedAt: now,
        "__v": 0
      }
    ]);
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection('skills').deleteMany({});
  }
};
