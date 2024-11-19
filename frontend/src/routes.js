import React from 'react'
import MemberListView from './views/pages/member/MemberListView'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Profile = React.lazy(() => import('./views/dashboard/Profile'))
const SocietyListView = React.lazy(() => import('./views/pages/society/SocietyListView'))
const createSociety = React.lazy(() => import('./views/pages/society/SocietyCreate'))
const updateSociety = React.lazy(() => import('./views/pages/society/SocietyUpdate'))
const societyDetails = React.lazy(() => import('./views/pages/society/SocietyDetailsView'))
const BlockListView = React.lazy(() => import('./views/pages/block/BlockListView'))
const createBlock = React.lazy(() => import('./views/pages/block/BlockCreate'))
const updateBlock = React.lazy(() => import('./views/pages/block/BlockUpdate'))
const blockDetails = React.lazy(() => import('./views/pages/block/BlockDetailsView'))
const HouseListView = React.lazy(() => import('./views/pages/house/HouseListView'))
const createHouse = React.lazy(() => import('./views/pages/house/HouseCreate'))
const updateHouse = React.lazy(() => import('./views/pages/house/HouseUpdate'))
const houseDetails = React.lazy(() => import('./views/pages/house/HouseDetailsView'))
const memberListView = React.lazy(() => import('./views/pages/member/MemberListView'))
const createMember = React.lazy(() => import('./views/pages/member/MemberCreate'))
const updateMember = React.lazy(() => import('./views/pages/member/MemberUpdate'))
const memberDetails = React.lazy(() => import('./views/pages/member/MemberDetailsView'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/profile', name: 'Profile', element: Profile},
  { path: '/society', name: 'Society', element:SocietyListView},
  { path: '/society/create', name: 'Society Create', element:createSociety},
  { path: '/society/edit/:id', name: 'Society Update', element:updateSociety},
  { path: '/society/details/:id', name: 'Society Details', element:societyDetails},
  { path: '/block', name: 'Block', element:BlockListView},
  { path: '/block/create', name: 'Block Create', element:createBlock},
  { path: '/block/edit/:id', name: 'Block Update', element:updateBlock},
  { path: '/block/details/:id', name: 'Block Details', element:blockDetails},
  { path: '/house', name: 'House', element:HouseListView},
  { path: '/house/create', name: 'House Create', element:createHouse},
  { path: '/house/edit/:id', name: 'House Update', element:updateHouse},
  { path: '/house/details/:id', name: 'House Details', element:houseDetails},
  { path: '/members', name: 'Member', element:memberListView},
  { path: '/members/create', name: 'Member Create', element:createMember},
  { path: '/members/edit/:id', name: 'Member Update', element:updateMember},
  { path: '/members/details/:id', name: 'Member Details', element:memberDetails},
]

export default routes
