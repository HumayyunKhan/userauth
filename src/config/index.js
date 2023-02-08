const { Joi } = require('express-validation');
const dotenv =require("dotenv")
dotenv.config();
// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().default(4040),
  JWT_SECRET: Joi.string()
    .required()
    .description('JWT Secret required to sign'),
  JWT_EXPIRES_IN: Joi.number()
    .default(1440)
    .description('JWT expiration time in seconds'),
  DB_HOST: Joi.string().required().description('Database host is required'),
  DB_PORT: Joi.number().default(3306).description('Database port is required'),
  DB_USERNAME: Joi.string()
    .required()
    .description('Database username is required'),
  DB_PASSWORD: Joi.string().allow(''),
  DB_NAME: Joi.string().required().description('Database name is required'),
  DB_DIALECT: Joi.string()
    .default('mysql')
    .description('Database dialect is required'),
  NUM_VERIFY_URL: Joi.string()
    .required()
    .description('NumVerify url is required'),
  NUM_VERIFY_ACCESS_KEY: Joi.string()
    .required()
    .description('NumVerify access token is required'),
  S3_BUCKET_NAME: Joi.string()
    .required()
    .description('S3 Bucket Name is required'),
  S3_ACCESS_SECRET: Joi.string()
    .required()
    .description('S3 Access Secret is required'),
  S3_ACCESS_KEY: Joi.string()
    .required()
    .description('S3 Access key is required'),
})
  .unknown()
  .required();

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  jwtSecret: envVars.JWT_SECRET,
  jwtExpiresIn: envVars.JWT_EXPIRES_IN,
  db: {
    username: envVars.DB_USERNAME,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_NAME,
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    dialect: envVars.DB_DIALECT,
  },
  numVerify: {
    url: envVars.NUM_VERIFY_URL,
    accessKey: envVars.NUM_VERIFY_ACCESS_KEY,
  },
  S3Bucket: {
    bucketName: envVars.S3_BUCKET_NAME,
    accessKey: envVars.S3_ACCESS_KEY,
    secretKey: envVars.S3_ACCESS_SECRET,
  },
};

module.exports = config;
