import { getMongoUri } from './database';

describe('getMongoUri', () => {
  it('prefers MONGO_URI when both supported names are present', () => {
    expect(getMongoUri({
      MONGO_URI: 'mongodb+srv://primary.example/db',
      MONGODB_URI: 'mongodb://legacy.example/db',
    })).toBe('mongodb+srv://primary.example/db');
  });

  it('supports the legacy MONGODB_URI name', () => {
    expect(getMongoUri({
      MONGODB_URI: 'mongodb+srv://cluster.example/db',
    })).toBe('mongodb+srv://cluster.example/db');
  });

  it('uses local MongoDB only outside production when the URI is missing', () => {
    expect(getMongoUri({ NODE_ENV: 'development' })).toBe('mongodb://127.0.0.1:27017/viatech');
  });

  it('fails clearly when production has no database URI', () => {
    expect(() => getMongoUri({ NODE_ENV: 'production' }))
      .toThrow('MONGO_URI must be configured in production.');
  });

  it('rejects values that are not MongoDB connection strings', () => {
    expect(() => getMongoUri({ MONGO_URI: 'https://example.com' }))
      .toThrow('MONGO_URI must use the mongodb:// or mongodb+srv:// scheme.');
  });
});
