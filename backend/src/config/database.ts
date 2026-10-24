const LOCAL_MONGO_URI = 'mongodb://127.0.0.1:27017/viatech';

export function getMongoUri(env: NodeJS.ProcessEnv = process.env): string {
  const mongoUri = env.MONGO_URI?.trim() || env.MONGODB_URI?.trim();

  if (!mongoUri) {
    if (env.NODE_ENV === 'production') {
      throw new Error('MONGO_URI must be configured in production.');
    }
    return LOCAL_MONGO_URI;
  }

  if (!/^mongodb(\+srv)?:\/\//i.test(mongoUri)) {
    throw new Error('MONGO_URI must use the mongodb:// or mongodb+srv:// scheme.');
  }

  return mongoUri;
}
