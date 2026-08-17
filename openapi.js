const SCHEMAS = {
  FormatItem: {
    type: 'object',
    properties: {
      quality: { type: 'string', example: '1080p' },
      ext: { type: 'string', example: 'mp4' },
      url: { type: 'string', example: 'https://rr...googlevideo.com/videoplayback?expire=...' },
      filesize: { type: 'integer', nullable: true, example: 11832459 },
    },
  },
  AudioItem: {
    type: 'object',
    properties: {
      quality: { type: 'string', example: '128 kbps' },
      ext: { type: 'string', example: 'm4a' },
      url: { type: 'string', example: 'https://...' },
      filesize: { type: 'integer', nullable: true, example: 3051204 },
    },
  },
  MediaData: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'dQw4w9WgXcQ' },
      platform: { type: 'string', example: 'Youtube' },
      title: { type: 'string', example: 'Rick Astley - Never Gonna Give You Up (Official Video)' },
      thumbnail: { type: 'string', example: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg' },
      duration: { type: 'integer', example: 213 },
      uploader: { type: 'string', example: 'Rick Astley' },
      webpage_url: { type: 'string', example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      formats: { type: 'array', items: { $ref: '#/components/schemas/FormatItem' } },
      audio: { type: 'array', items: { $ref: '#/components/schemas/AudioItem' } },
    },
  },
  SuccessBody: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'success' },
      data: { $ref: '#/components/schemas/MediaData' },
    },
  },
  ErrorBody: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'error' },
      error: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'invalid_request' },
          message: { type: 'string', example: 'Field "url" wajib diisi.' },
        },
      },
    },
  },
};

const ERROR_RESPONSES = {
  400: { description: 'Parameter invalid / domain tidak diizinkan', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
  404: { description: 'Format tidak ditemukan / endpoint tidak ada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
  429: { description: 'Rate limit tercapai (20 req/menit/IP)', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
  502: { description: 'Gagal scrape dari platform', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
};

function queryUrlParam(desc) {
  return {
    name: 'url',
    in: 'query',
    required: true,
    description: desc,
    schema: { type: 'string', format: 'uri', example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  };
}

function buildOpenApiSpec(host) {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Media Downloader API',
      description: 'Download video & audio dari YouTube, Instagram, Facebook, TikTok, dan X/Twitter. Gratis, tanpa login.\n\n**Base URL:** `' + host + '`\n\n**Batas:** 20 request/menit per IP.',
      version: '2.0.0',
      contact: { name: 'Media Downloader', url: host },
    },
    servers: [{ url: host }],
    tags: [
      { name: 'Download', description: 'Ekstrak media dari URL' },
      { name: 'Platform', description: 'Endpoint spesifik platform' },
    ],
    paths: {
      '/api/download': {
        post: {
          tags: ['Download'],
          summary: 'Download media (deteksi platform otomatis)',
          operationId: 'downloadCreate',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['url'],
                  properties: {
                    url: { type: 'string', format: 'uri', example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
                    type: { type: 'string', enum: ['video', 'mp3'], description: 'mp3 = ekstrak audio saja', default: 'video' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Berhasil. Data media + daftar format.', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessBody' } } } },
            ...ERROR_RESPONSES,
          },
        },
        get: {
          tags: ['Download'],
          summary: 'Download media via query param',
          operationId: 'downloadGet',
          parameters: [queryUrlParam('Link video/audio yang mau di-download'), { name: 'type', in: 'query', schema: { type: 'string', enum: ['video', 'mp3'] } }],
          responses: {
            200: { description: 'Berhasil. Data media + daftar format.', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessBody' } } } },
            ...ERROR_RESPONSES,
          },
        },
      },
      '/api/yt': { get: { tags: ['Platform'], summary: 'YouTube', operationId: 'yt', parameters: [queryUrlParam('Link YouTube (watch, youtu.be, shorts)')], responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessBody' } } } }, ...ERROR_RESPONSES } } },
      '/api/ig': { get: { tags: ['Platform'], summary: 'Instagram', operationId: 'ig', parameters: [queryUrlParam('Link post/reel Instagram')], responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessBody' } } } }, ...ERROR_RESPONSES } } },
      '/api/fb': { get: { tags: ['Platform'], summary: 'Facebook', operationId: 'fb', parameters: [queryUrlParam('Link video Facebook')], responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessBody' } } } }, ...ERROR_RESPONSES } } },
      '/api/tt': { get: { tags: ['Platform'], summary: 'TikTok', operationId: 'tt', parameters: [queryUrlParam('Link video TikTok')], responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessBody' } } } }, ...ERROR_RESPONSES } } },
      '/api/x': { get: { tags: ['Platform'], summary: 'X / Twitter', operationId: 'x', parameters: [queryUrlParam('Link tweet berisi video')], responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessBody' } } } }, ...ERROR_RESPONSES } } },
      '/api/mp3': { get: { tags: ['Platform'], summary: 'Ekstrak audio (MP3)', operationId: 'mp3', parameters: [queryUrlParam('Link video apa pun')], responses: { 200: { description: 'OK. Hanya berisi audio.', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessBody' } } } }, ...ERROR_RESPONSES } } },
    },
    components: {
      schemas: SCHEMAS,
      securitySchemes: {},
    },
  };
}

module.exports = { buildOpenApiSpec };