// AI services (平台无关)
export * from './ai';

// DB services 仅在原生平台导出
// Web 平台使用动态导入: await import('./db')
export * from './db';
