import Joi from 'joi';

class ChallengesDTO {
    id: string | undefined;
    challengeName: string | undefined;
    endDate: string | undefined;
    duration: number | undefined;
    moneyPrize: string | undefined;
    contactEmail!: string;
    projectDescription: string | undefined;
    projectBrief: string | undefined;
    projectTasks: string | undefined;
    challengeCategory!: 'Web Design' | 'UI/UX' | 'Frontend' | 'Backend' | 'Fullstack' | 'Mobile' | 'Data Science' | 'Cybersecurity' | 'Cloud Computing' | 'DevOps' | 'AI/ML' | 'IoT' | 'Blockchain' | 'AR/VR' | 'Game Development' | 'Robotics' | 'Digital Marketing' | 'Content Writing' | 'Graphic Design' | 'Video Editing' | 'Animation' | 'Music Production' | 'Photography' | '3D Modelling' | 'CAD Design' | 'Interior Design' | 'Fashion Design' | 'Product Design' | 'Architecture' | 'Civil Engineering' | 'Mechanical Engineering' | 'Electrical Engineering' | 'Aerospace Engineering' | 'Automotive Engineering';
    status: 'open' | 'ongoing' | 'completed' | undefined;

    constructor(
        id: string | undefined,
        challengeName: string | undefined,
        endDate: string | undefined,
        duration: number | undefined,
        moneyPrize: string | undefined,
        contactEmail: string,
        projectDescription: string | undefined,
        projectBrief: string | undefined,
        projectTasks: string | undefined,
        challengeCategory: 'Web Design' | 'UI/UX' | 'Frontend' | 'Backend' | 'Fullstack' | 'Mobile' | 'Data Science' | 'Cybersecurity' | 'Cloud Computing' | 'DevOps' | 'AI/ML' | 'IoT' | 'Blockchain' | 'AR/VR' | 'Game Development' | 'Robotics' | 'Digital Marketing' | 'Content Writing' | 'Graphic Design' | 'Video Editing' | 'Animation' | 'Music Production' | 'Photography' | '3D Modelling' | 'CAD Design' | 'Interior Design' | 'Fashion Design' | 'Product Design' | 'Architecture' | 'Civil Engineering' | 'Mechanical Engineering' | 'Electrical Engineering' | 'Aerospace Engineering' | 'Automotive Engineering',
        status: 'open' | 'ongoing' | 'completed' | undefined
    ) {
        this.id = id;
        this.challengeName = challengeName;
        this.endDate = endDate;
        this.duration = duration;
        this.moneyPrize = moneyPrize;
        this.contactEmail = contactEmail;
        this.projectDescription = projectDescription;
        this.projectBrief = projectBrief;
        this.projectTasks = projectTasks;
        this.challengeCategory = challengeCategory;
        this.status = status;
    }

    // Add a method to validate the data using Joi
    static validate(data: {
        id: string;
        challengeName: string;
        endDate: string;
        duration: number;
        moneyPrize: string;
        contactEmail: string;
        projectDescription: string;
        projectBrief: string;
        projectTasks: string;
        challengeCategory: 'Web Design' | 'UI/UX' | 'Frontend' | 'Backend' | 'Fullstack' | 'Mobile' | 'Data Science' | 'Cybersecurity' | 'Cloud Computing' | 'DevOps' | 'AI/ML' | 'IoT' | 'Blockchain' | 'AR/VR' | 'Game Development' | 'Robotics' | 'Digital Marketing' | 'Content Writing' | 'Graphic Design' | 'Video Editing' | 'Animation' | 'Music Production' | 'Photography' | '3D Modelling' | 'CAD Design' | 'Interior Design' | 'Fashion Design' | 'Product Design' | 'Architecture' | 'Civil Engineering' | 'Mechanical Engineering' | 'Electrical Engineering' | 'Aerospace Engineering' | 'Automotive Engineering';
    }) {
        const schema = Joi.object({
            challengeName: Joi.string().required(),
            endDate: Joi.string().required(),
            duration: Joi.number().required(),
            moneyPrize: Joi.string().required(),
            contactEmail: Joi.string().email().required(),
            projectDescription: Joi.string().required(),
            projectBrief: Joi.string().required(),
            projectTasks: Joi.string().required(),
            challengeCategory: Joi.string().valid(
                'Web Design', 'UI/UX', 'Frontend', 'Backend', 'Fullstack', 'Mobile', 'Data Science', 'Cybersecurity', 'Cloud Computing', 'DevOps', 'AI/ML', 'IoT', 'Blockchain', 'AR/VR', 'Game Development', 'Robotics', 'Digital Marketing', 'Content Writing', 'Graphic Design', 'Video Editing', 'Animation', 'Music Production', 'Photography', '3D Modelling', 'CAD Design', 'Interior Design', 'Fashion Design', 'Product Design', 'Architecture', 'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Aerospace Engineering', 'Automotive Engineering', 'Bioinformatics', 'Quantum Computing', 'Network Engineering', 'Systems Engineering'
            ).required()
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: ChallengesDTO.formatValidationErrors(error.details)
            };
        }
        return { value };
    }

    // Helper method to format Joi validation errors
    static formatValidationErrors(errorDetails: Joi.ValidationErrorItem[]) {
        return errorDetails.map((error) => ({
            field: error.context?.key,
            type: error.type,
            message: error.message
        }));
    }
}

module.exports = ChallengesDTO;
