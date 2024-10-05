import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://octaerpservice.com" target="_blank" rel="noopener noreferrer">
          octaerpservice
        </a>
        <span className="ms-1">&copy; 2024 </span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Develop by</span>
        <a href="https://mehulrana.com" target="_blank" rel="noopener noreferrer">Mehul Rana
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
