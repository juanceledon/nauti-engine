import { DashboardData } from '../models/dashboard.models';

export const DASHBOARD_MOCK: DashboardData = {

  operation: {
    id: 'OP-001',
    origin: 'Manzanillo',
    destination: 'Guadalajara',
    mandate_max_price: 9000,
    currency: 'MXN',
    mandate_target_date: '2026-09-03',
    mandate_start_time: '08:00',
    mandate_end_time: '12:00',
    status: 'NEGOTIATING'
  },

  carriers: [
    {
      id: 'CARRIER-001',
      name: 'Transportes del Pacífico',
      owner_name: 'Carlos Mendoza',
      phone: '+52 555 000 0001',
      email: 'operations@transportespacifico.mx',
      primary_route: 'Manzanillo → Guadalajara',
      info_link: '',
      agent_summary:
        'Carrier especializado en drayage desde Manzanillo.'
    },

    {
      id: 'CARRIER-002',
      name: 'Logística Azteca',
      owner_name: 'Mariana López',
      phone: '+52 555 000 0002',
      email: 'dispatch@logisticaazteca.mx',
      primary_route: 'Manzanillo → Guadalajara',
      info_link: '',
      agent_summary:
        'Carrier regional con cobertura hacia Guadalajara.'
    },

    {
      id: 'CARRIER-003',
      name: 'Carga Express MX',
      owner_name: 'José Ramírez',
      phone: '+52 555 000 0003',
      email: 'dispatch@cargaexpress.mx',
      primary_route: 'Manzanillo → Guadalajara',
      info_link: '',
      agent_summary:
        'Carrier de transporte terrestre y contenedores.'
    }
  ],

  quotes: [
    {
      id: 'QUOTE-001',
      operation_id: 'OP-001',

      carrier_id: 'CARRIER-001',
      carrier_name: 'Transportes del Pacífico',

      initial_price: 9200,
      quoted_price: 8700,

      currency: 'MXN',

      pickup_date: '2026-09-03',
      pickup_time: '09:00',

      reliability: 0.94,

      valid: true,
      invalid_reason: [],

      score: 94,

      status: 'VALID'
    },

    {
      id: 'QUOTE-002',
      operation_id: 'OP-001',

      carrier_id: 'CARRIER-002',
      carrier_name: 'Logística Azteca',

      initial_price: 9800,
      quoted_price: 9500,

      currency: 'MXN',

      pickup_date: '2026-09-03',
      pickup_time: '10:00',

      reliability: 0.89,

      valid: false,

      invalid_reason: [
        'Price exceeds mandate maximum of 9,000 MXN'
      ],

      score: 61,

      status: 'REJECTED'
    },

    {
      id: 'QUOTE-003',
      operation_id: 'OP-001',

      carrier_id: 'CARRIER-003',
      carrier_name: 'Carga Express MX',

      initial_price: 9100,
      quoted_price: 8900,

      currency: 'MXN',

      pickup_date: '2026-09-03',
      pickup_time: '08:30',

      reliability: 0.91,

      valid: true,
      invalid_reason: [],

      score: 90,

      status: 'VALID'
    }
  ],

  best_valid_quote: {
    id: 'QUOTE-001',
    operation_id: 'OP-001',

    carrier_id: 'CARRIER-001',
    carrier_name: 'Transportes del Pacífico',

    initial_price: 9200,
    quoted_price: 8700,

    currency: 'MXN',

    pickup_date: '2026-09-03',
    pickup_time: '09:00',

    reliability: 0.94,

    valid: true,
    invalid_reason: [],

    score: 94,

    status: 'VALID'
  },

  commitments: [],

  active_commitment: null,

  call_briefs: [
    {
      id: 'CALL-001',

      operation_id: 'OP-001',

      carrier_id: 'CARRIER-001',
      carrier_name: 'Transportes del Pacífico',

      direction: 'OUTBOUND',

      actions: [
        'Requested quote',
        'Negotiated price',
        'Confirmed pickup availability'
      ],

      prices_mentioned: [
        '9,200 MXN',
        '8,700 MXN'
      ],

      objections: [
        'Carrier initially requested a higher rate'
      ],

      changed_facts: [
        'Price reduced from 9,200 MXN to 8,700 MXN'
      ],

      result:
        'Carrier offered 8,700 MXN for pickup at 09:00.'
    }
  ],

  escalations: [],

  audit_events: [
    {
      id: 'AUDIT-001',

      operation_id: 'OP-001',

      event_type: 'OPERATION_CREATED',

      message:
        'Mandate created: maximum 9,000 MXN, pickup between 08:00 and 12:00.',

      timestamp: '13:25:00'
    },

    {
      id: 'AUDIT-002',

      operation_id: 'OP-001',

      event_type: 'CALL_STARTED',

      message:
        'Outbound negotiation started with Transportes del Pacífico.',

      timestamp: '13:27:00'
    },

    {
      id: 'AUDIT-003',

      operation_id: 'OP-001',

      event_type: 'QUOTE_RECEIVED',

      message:
        'Transportes del Pacífico quoted 8,700 MXN.',

      timestamp: '13:30:00'
    },

    {
      id: 'AUDIT-004',

      operation_id: 'OP-001',

      event_type: 'QUOTE_REJECTED',

      message:
        'Logística Azteca quoted 9,500 MXN, exceeding the mandate.',

      timestamp: '13:31:00'
    },

    {
      id: 'AUDIT-005',

      operation_id: 'OP-001',

      event_type: 'BEST_QUOTE_SELECTED',

      message:
        'Transportes del Pacífico selected as best valid quote at 8,700 MXN.',

      timestamp: '13:32:00'
    }
  ],

  metrics: {
    quotes: 3,
    valid_quotes: 2,
    commitments: 0,
    verified_commitments: 0,
    calls: 3,
    escalations: 0
  }
};