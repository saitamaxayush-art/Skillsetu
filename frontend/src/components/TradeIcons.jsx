import React from 'react'

export function TradeIcon({ id, size = 24, className = '' }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: `trade-svg-icon ${className}`,
    'aria-hidden': 'true',
  }

  switch (id) {
    case 'tailoring':
      return (
        <svg {...props}>
          {/* Needle, thread spool & scissors outline */}
          <path d="M6 3v7a6 6 0 0 0 12 0V3" />
          <line x1="4" y1="3" x2="20" y2="3" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="18" r="3" />
          <path d="m8.5 16 7-8" />
          <path d="m15.5 16-7-8" />
        </svg>
      )

    case 'electrician':
      return (
        <svg {...props}>
          {/* Bolt and circuit */}
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )

    case 'plumbing':
      return (
        <svg {...props}>
          {/* Wrench & water droplet */}
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )

    case 'carpentry':
      return (
        <svg {...props}>
          {/* Wood saw & hammer */}
          <path d="m14 12 6-6a2 2 0 0 0-2.83-2.83l-6 6" />
          <path d="M4 20l7-7" />
          <path d="m14 15 2 2" />
          <path d="m11 12 2 2" />
          <path d="m8 9 2 2" />
          <path d="M3 21h4v-4H3z" />
        </svg>
      )

    case 'cooking':
      return (
        <svg {...props}>
          {/* Cooking pot & steam */}
          <path d="M3 11h18v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-7z" />
          <path d="M2 11h20" />
          <path d="M7 7c0-1.5 1-2 1-3" />
          <path d="M12 7c0-1.5 1-2 1-3" />
          <path d="M17 7c0-1.5 1-2 1-3" />
        </svg>
      )

    case 'beauty':
      return (
        <svg {...props}>
          {/* Salon scissors & sparkles */}
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <line x1="20" y1="4" x2="8.12" y2="15.88" />
          <line x1="14.47" y1="14.48" x2="20" y2="20" />
          <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </svg>
      )

    case 'driving':
      return (
        <svg {...props}>
          {/* Steering wheel */}
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="2" x2="12" y2="9" />
          <line x1="3.3" y1="16.5" x2="9.5" y2="13.5" />
          <line x1="20.7" y1="16.5" x2="14.5" y2="13.5" />
        </svg>
      )

    case 'webdev':
      return (
        <svg {...props}>
          {/* Code display screen */}
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <path d="m7 8-3 3 3 3" />
          <path d="m17 8 3 3-3 3" />
          <line x1="13" y1="7" x2="11" y2="15" />
        </svg>
      )

    case 'data_entry':
      return (
        <svg {...props}>
          {/* Spreadsheet table & keyboard */}
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="15" y1="3" x2="15" y2="21" />
        </svg>
      )

    case 'mobile_repair':
      return (
        <svg {...props}>
          {/* Smartphone with wrench tool */}
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
          <path d="m10 8 4 4" />
          <path d="m14 8-4 4" />
        </svg>
      )

    case 'handicrafts':
      return (
        <svg {...props}>
          {/* Craft artisan tool & sparkle */}
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
        </svg>
      )

    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
  }
}

export function GoalIcon({ id, size = 24, className = '' }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: `goal-svg-icon ${className}`,
    'aria-hidden': 'true',
  }

  switch (id) {
    case 'job':
      return (
        <svg {...props}>
          {/* Briefcase */}
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )
    case 'apprenticeship':
      return (
        <svg {...props}>
          {/* Graduation cap */}
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      )
    case 'training':
      return (
        <svg {...props}>
          {/* Open book */}
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      )
    case 'wfh':
      return (
        <svg {...props}>
          {/* House with laptop */}
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    case 'business':
      return (
        <svg {...props}>
          {/* Store / Shop */}
          <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
          <path d="M2 7h20" />
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
  }
}

