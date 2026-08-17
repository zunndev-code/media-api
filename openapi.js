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
  User: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      email: { type: 'string' },
      role: { type: 'string', example: 'free' },
      roleInfo: { type: 'object', properties: { label: { type: 'string' }, daily: { type: 'integer' }, price: { type: 'integer' } } },
      credits: { type: 'integer' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  ApiKey: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      key: { type: 'string', example: 'md_...' },
      active: { type: 'boolean' },
      hits: { type: 'integer' },
      created_at: { type: 'string', format: 'date-time' },
      last_used: { type: 'string', format: 'date-time', nullable: true },
    },
  },
  DayStat: {
    type: 'object',
    properties: {
      date: { type: 'string', example: '2026-08-17' },
      hits: { type: 'integer' },
    },
  },
  SuccessBody: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'success' },
      data: { type: 'object' },
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
  401: { description: 'Belum login / API key tidak valid', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
  402: { description: 'Credit habis', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
  403: { description: 'API key dinonaktifkan / akses ditolak', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
  404: { description: 'Format tidak ditemukan / endpoint tidak ada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
  409: { description: 'Email sudah terdaftar', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
  429: { description: 'Rate limit tercapai (60 req/menit/IP)', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
  502: { description: 'Gagal scrape dari platform', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } } } },
};

function okResp(desc, extra) {
  return {
    description: desc,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessBody' } } },
    ...(extra || {}),
  };
}

function queryUrlParam(desc) {
  return {
    name: 'url',
    in: 'query',
    required: true,
    description: desc,
    schema: { type: 'string', format: 'uri', example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  };
}

function withKey(operation) {
  return {
    ...operation,
    parameters: [
      ...(operation.parameters || []),
      {
        name: 'X-API-Key',
        in: 'header',
        required: false,
        description: 'API key kamu (md_...). Kalau dipakai: 1 request sukses = 1 credit.',
        schema: { type: 'string', example: 'md_xxx' },
      },
    ],
  };
}

function mediaPath(platform, summary, paramDesc, opId) {
  return {
    get: withKey({
      tags: ['Download'],
      summary,
      operationId: opId,
      parameters: [queryUrlParam(paramDesc)],
      responses: { 200: okResp('Berhasil. Data media + daftar format.'), ...ERROR_RESPONSES },
    }),
  };
}

function buildOpenApiSpec(host) {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Zunndev API',
      description:
        'Platform API Indonesia: media downloader, music tools, image tools — dan terus bertambah.\n\n' +
        '**Base URL:** `' + host + '`\n\n' +
        '**Cara pakai:**\n' +
        '1. Daftar gratis di `/register.html` (langsung dapat 1000 credit, tambah 1000 tiap hari)\n' +
        '2. Buat API key di `/dashboard.html`\n' +
        '3. Kirim key lewat header `X-API-Key`\n\n' +
        '**Credit:** 1 request sukses = 1 credit. Tanpa key tetap bisa (dibatasi rate limit IP).',
      version: '3.0.0',
      contact: { name: 'Zunndev API', url: host },
    },
    servers: [{ url: host }],
    tags: [
      { name: 'Auth', description: 'Register, login, logout, info akun' },
      { name: 'Keys', description: 'Kelola API key' },
      { name: 'Stats', description: 'Statistik global & pemakaian' },
      { name: 'Payment', description: 'Pesanan upgrade role via QRIS' },
      { name: 'Download', description: 'Ekstrak media dari URL (layanan Media Downloader)' },
    ],
    paths: {
      '/api': {
        get: {
          tags: ['Auth'],
          summary: 'Info API & daftar endpoint',
          operationId: 'apiInfo',
          responses: { 200: okResp('Info platform.') },
        },
      },
      '/api/register': {
        post: {
          tags: ['Auth'],
          summary: 'Daftar akun baru (langsung dapat 1000 credit)',
          operationId: 'register',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Budi' },
                    email: { type: 'string', format: 'email', example: 'budi@mail.com' },
                    password: { type: 'string', minLength: 6, example: 'rahasia123' },
                  },
                },
              },
            },
          },
          responses: { 201: okResp('Terdaftar + cookie login diset.'), ...ERROR_RESPONSES },
        },
      },
      '/api/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login (email + password)',
          operationId: 'login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'budi@mail.com' },
                    password: { type: 'string', example: 'rahasia123' },
                  },
                },
              },
            },
          },
          responses: { 200: okResp('Login sukses, cookie diset.'), ...ERROR_RESPONSES },
        },
      },
      '/api/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout',
          operationId: 'logout',
          responses: { 200: okResp('Cookie dihapus.') },
        },
      },
      '/api/me': {
        get: {
          tags: ['Auth'],
          summary: 'Info akun + key + pemakaian hari ini (perlu login)',
          operationId: 'me',
          responses: { 200: okResp('Data akun.'), ...ERROR_RESPONSES },
        },
      },
      '/api/orders': {
        get: {
          tags: ['Payment'],
          summary: 'Daftar pesanan role kamu',
          operationId: 'ordersList',
          responses: { 200: okResp('Daftar pesanan.'), ...ERROR_RESPONSES },
        },
        post: {
          tags: ['Payment'],
          summary: 'Buat pesanan + QRIS untuk upgrade role',
          operationId: 'ordersCreate',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['role'],
                  properties: { role: { type: 'string', enum: ['vip', 'gars', 'vilions', 'verus'], example: 'vip' } },
                },
              },
            },
          },
          responses: { 201: okResp('Pesanan dibuat, QRIS siap dibayar.'), ...ERROR_RESPONSES },
        },
      },
      '/api/orders/{id}': {
        get: {
          tags: ['Payment'],
          summary: 'Cek status pesanan (otomatis cek ke QRIS.PW)',
          operationId: 'ordersGet',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: okResp('Status pesanan terbaru.'), ...ERROR_RESPONSES },
        },
      },
      '/api/orders/{id}/cancel': {
        post: {
          tags: ['Payment'],
          summary: 'Batalkan pesanan yang masih pending',
          operationId: 'ordersCancel',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: okResp('Pesanan dibatalkan.'), ...ERROR_RESPONSES },
        },
      },
      '/api/webhook/qris': {
        post: {
          tags: ['Payment'],
          summary: 'Webhook notifikasi pembayaran dari QRIS.PW',
          operationId: 'qrisWebhook',
          responses: { 200: okResp('Acknowledged.'), 401: okResp('Signature tidak valid.') },
        },
      },
      '/api/keys': {
        get: {
          tags: ['Keys'],
          summary: 'Daftar API key milik kamu',
          operationId: 'keysList',
          responses: { 200: okResp('Daftar key.'), ...ERROR_RESPONSES },
        },
        post: {
          tags: ['Keys'],
          summary: 'Buat API key baru',
          operationId: 'keysCreate',
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { name: { type: 'string', example: 'bot-wa' } },
                },
              },
            },
          },
          responses: { 201: okResp('Key dibuat. Simpan key-nya — tidak bisa dilihat lagi.'), ...ERROR_RESPONSES },
        },
      },
      '/api/keys/{id}/toggle': {
        post: {
          tags: ['Keys'],
          summary: 'Aktifkan / nonaktifkan key',
          operationId: 'keysToggle',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: okResp('Status key diubah.'), ...ERROR_RESPONSES },
        },
      },
      '/api/keys/{id}': {
        delete: {
          tags: ['Keys'],
          summary: 'Hapus key',
          operationId: 'keysDelete',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: okResp('Key dihapus.'), ...ERROR_RESPONSES },
        },
      },
      '/api/stats': {
        get: {
          tags: ['Stats'],
          summary: 'Statistik global (publik)',
          operationId: 'stats',
          responses: { 200: okResp('hitsToday, hitsTotal, users.') },
        },
      },
      '/api/stats/daily': {
        get: {
          tags: ['Stats'],
          summary: 'Hits per hari 14 hari terakhir. Kalau login, ikut data kamu.',
          operationId: 'statsDaily',
          responses: { 200: okResp('days[].data + me (jika login).') },
        },
      },
      '/api/roles': {
        get: {
          tags: ['Stats'],
          summary: 'Daftar role & harga',
          operationId: 'roles',
          responses: { 200: okResp('Role: free, vip, gars, vilions, verus.') },
        },
      },
      '/api/apis': {
        get: {
          tags: ['Stats'],
          summary: 'Daftar layanan API',
          operationId: 'apis',
          responses: { 200: okResp('Daftar layanan (live / segera).') },
        },
      },
      '/api/download': {
        post: withKey({
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
          responses: { 201: okResp('Berhasil. Data media + daftar format.'), ...ERROR_RESPONSES },
        }),
        get: withKey({
          tags: ['Download'],
          summary: 'Download media via query param',
          operationId: 'downloadGet',
          parameters: [queryUrlParam('Link video/audio yang mau di-download'), { name: 'type', in: 'query', schema: { type: 'string', enum: ['video', 'mp3'] } }],
          responses: { 200: okResp('Berhasil. Data media + daftar format.'), ...ERROR_RESPONSES },
        }),
      },
      '/api/yt': mediaPath('yt', 'YouTube (watch, youtu.be, shorts)', 'Link YouTube', 'yt'),
      '/api/ig': mediaPath('ig', 'Instagram (post/reel)', 'Link Instagram', 'ig'),
      '/api/fb': mediaPath('fb', 'Facebook (video)', 'Link Facebook', 'fb'),
      '/api/tt': mediaPath('tt', 'TikTok (video)', 'Link TikTok', 'tt'),
      '/api/x': mediaPath('x', 'X / Twitter (tweet berisi video)', 'Link X/Twitter', 'x'),
      '/api/mp3': mediaPath('mp3', 'Ekstrak audio (MP3) dari platform mana pun', 'Link video apa pun', 'mp3'),
    },
    components: {
      schemas: SCHEMAS,
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key dari dashboard. 1 request sukses = 1 credit.',
        },
      },
    },
  };
}

module.exports = { buildOpenApiSpec };