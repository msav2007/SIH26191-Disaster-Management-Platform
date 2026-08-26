import { customType } from 'drizzle-orm/pg-core';

type GeometryConfig = {
  geometryType?: string;
  srid?: number;
};

export const geometry = customType<{ data: string; config: GeometryConfig }>({
  dataType(config) {
    const geometryType = config?.geometryType ?? 'Geometry';
    const srid = config?.srid ?? 4326;

    return `geometry(${geometryType}, ${srid})`;
  },
});

