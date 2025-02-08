module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const now = new Date();
    const skills = [
      'Web Design',
      'UI/UX',
      'Frontend',
      'Backend',
      'Fullstack',
      'Mobile Development',
      'Cybersecurity',
      'Cloud Computing',
      'DevOps',
      'AI/ML',
      'Game Development',
      'Graphic Design',
      'Animation',
      'Product Design',
      'Network Engineering',
      'Systems Engineering'
    ].map(skillName => ({
      skillName,
      status: "active",
      createdAt: now,
      updatedAt: now,
      "__v": 0
    }));

    await db.collection('skills').insertMany(skills);
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
