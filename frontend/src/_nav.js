import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilHouse,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Society',
    to: '/society',
    icon: <i class="bi bi-building nav-icon"></i>,
  },
  {
    component: CNavItem,
    name: 'Block',
    to: '/block',
    icon: <i class="bi bi-square-fill nav-icon"></i>,
  },
  {
    component: CNavItem,
    name: 'House',
    to: '/house',
    icon: <CIcon icon={cilHouse} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Member',
    to: '/member',
    icon: <i class="bi bi-people nav-icon"></i>,
  }
]

export default _nav
