import Joi from 'joi';

const schema = Joi.object({
  email: Joi.string().email()
      .required()
      .trim(),
  password: Joi.string()
      .required()
      .min(6)
});

export default async (req, res, next) => {
  try {
    const value = await schema.validateAsync(req.body);
    next();
  } catch (error) {
    res.status(400).send({
      ok: false,
      error: error?.details[0]?.message
    });
  }
}