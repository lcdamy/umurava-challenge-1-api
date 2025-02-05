module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const now = new Date();
    const skills = [
      "Javascript",
      "Python",
      "Java",
      "PHP",
      "Ruby",
      "Go",
      "Rust",
      "Swift",
      "Kotlin",
      "TypeScript",
      "SQL",
      "NoSQL",
      "Web Development",
      "Mobile Development",
      "Backend Development",
      "Frontend Development",
      "UI/UX",
      "Data Science",
      "Machine Learning",
      "Artificial Intelligence",
      "Computer Vision"

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
