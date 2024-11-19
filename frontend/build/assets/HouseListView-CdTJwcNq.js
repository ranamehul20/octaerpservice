import{r as t,u as k,j as s,C as D}from"./index-DnRDX3w2.js";import{X as T}from"./DefaultLayout-5rBFB6PH.js";import{l as B}from"./HouseService-DdV0A_2O.js";import{C as E,a as L}from"./CRow-1tTMpDHO.js";import{C as F}from"./CAlert-F9qhzg3x.js";import{C as M,b as a}from"./index.esm-DBaUAKo-.js";import{C as A,a as R}from"./CCardBody-DCdMFWZv.js";import{C as V}from"./CCardHeader-D4DRa4G8.js";import{C as _}from"./CFormInput-DldqsSPp.js";import{M as r,B as h}from"./Modal-DzXcSjhT.js";import"./CCloseButton-DW2grjsO.js";import"./MemberDetailsView-CTXHKFj-.js";const Y=()=>{const[n,f]=t.useState([]),[i,c]=t.useState(!0),[d,m]=t.useState(null),[x,o]=t.useState(!1),[P,C]=t.useState(null),[u,j]=t.useState(""),l=k();t.useEffect(()=>{p()},[]);const p=async()=>{try{const e=await B();e.code===200&&!e.error?f(e.results):m("Failed to fetch house. Please try again later."),c(!1)}catch{m("Failed to fetch house. Please try again later."),c(!1)}};if(i)return s.jsx(E,{className:"justify-content-center",children:s.jsx(L,{xs:"auto",children:s.jsx(D,{color:"primary"})})});if(d)return s.jsx(F,{color:"danger",children:d});const y=async e=>{o(!1)},g=e=>{C(e),o(!0)},b=e=>{l(`/house/details/${e}`)},v=e=>{l(`/house/edit/${e}`)},H=()=>{console.log("Create"),l("/house/create")},N=n.filter(e=>e.name.toLowerCase().includes(u.toLowerCase())),w=[{name:"#",cell:(e,S)=>S+1,sortable:!1},{name:"society",selector:e=>e.society,sortable:!0},{name:"Block",selector:e=>e.block,sortable:!0},{name:"Name",selector:e=>e.name,sortable:!0},{name:"Type",selector:e=>e.type,sortable:!0},{name:"Action",selector:null,sortable:!1,cell:e=>s.jsxs("div",{children:[s.jsx(a,{color:"info",onClick:()=>b(e._id),className:"mt-2 me-2 mb-2",children:"View"}),s.jsx(a,{color:"warning",className:"mt-2 me-2 mb-2",onClick:()=>v(e._id),children:"Edit"}),s.jsx(a,{color:"danger",className:"mb-2",onClick:()=>g(e._id),children:"Delete"})]})}];return s.jsxs(M,{children:[s.jsxs(A,{className:"mb-4",children:[s.jsx(V,{children:"House List"}),s.jsxs(R,{children:[s.jsx("div",{className:"d-flex justify-content-end mb-3",children:s.jsx(a,{color:"primary",onClick:H,className:"mb-3",children:"Create House"})}),s.jsx("div",{className:"d-flex justify-content-end mb-3",children:s.jsx(_,{className:"mb-3",type:"text",placeholder:"Search by house name...",value:u,onChange:e=>j(e.target.value),style:{width:"300px",marginTop:"10px"}})}),i?s.jsx("div",{children:"Loading..."}):n.length===0?s.jsx("div",{className:"text-center",children:"No records found"}):s.jsx(T,{columns:w,data:N,pagination:!0,highlightOnHover:!0,striped:!0,responsive:!0})]})]}),s.jsxs(r,{show:x,onHide:()=>o(!1),centered:!0,children:[s.jsx(r.Header,{onClose:()=>o(!1),children:s.jsx(r.Title,{children:"Delete House"})}),s.jsx(r.Body,{children:"Are you sure you want to delete this House?"}),s.jsxs(r.Footer,{children:[s.jsx(h,{variant:"secondary",onClick:()=>o(!1),children:"Close"}),s.jsx(h,{variant:"danger",onClick:()=>y(),children:"Delete"})]})]})]})};export{Y as default};