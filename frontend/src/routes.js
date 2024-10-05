import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
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

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
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
  { path: '/member', name: 'Member', element:BlockListView},
  { path: '/member/create', name: 'Member Create', element:createBlock},
  { path: '/member/edit/:id', name: 'Member Update', element:createBlock},
  { path: '/member/details/:id', name: 'Member Details', element:createBlock},
]

export default routes
