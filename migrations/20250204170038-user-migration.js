const { mockAdminUser, mockParticipanteUser } = require("../dist/utils/helper");

module.exports = {
  /**
   * @param {import('mongodb').Db} db
   * @param {import('mongodb').MongoClient} client
   * @returns {Promise<void>}
   */
  async up(db) {
    const now = new Date();
    const users = [...mockAdminUser(), ...mockParticipanteUser()].map(user => ({
      ...user,
      createdAt: now,
      updatedAt: now
    }));

    try {
      await db.collection('users').insertMany(users);
    } catch (error) {
      console.error('Error inserting users:', error);
      throw error;
    }
  },

  /**
   * @param {import('mongodb').Db} db
   * @param {import('mongodb').MongoClient} client
   * @returns {Promise<void>}
   */
  async down(db) {
    try {
      await db.collection('users').deleteMany({});
    } catch (error) {
      console.error('Error deleting users:', error);
      throw error;
    }
  }
};
