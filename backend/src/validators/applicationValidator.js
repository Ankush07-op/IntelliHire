const Joi = require("joi");

const applicationSchema = Joi.object({
  jobId: Joi.string().required(),
  applicantId: Joi.string().required(),
});

module.exports = applicationSchema;