import{r as o,j as e}from"./index-BOQoDeiJ.js";import{g,c as b}from"./BlockService-CCfFz_sy.js";import{C as a,a as c}from"./CRow-DZKMKKzZ.js";import{C as N,a as v}from"./CCardBody-Dm0V9Iwv.js";import{C as F}from"./CCardHeader-C3St3R9K.js";import{C as H}from"./CForm-BmkLFAKO.js";import{a as m,C as h}from"./CFormInput-kvLYk_aa.js";import{C as B}from"./CFormSelect-B18wGbu2.js";import{a as I}from"./index.esm-BDIoaTPO.js";import{C as x}from"./CAlert-Bm5RWCiZ.js";import"./cil-user-CBnTYt-8.js";const G=()=>{const[r,l]=o.useState({name:"",totalHouse:"",societyId:""}),[n,i]=o.useState(null),[C,d]=o.useState(!1),[f,j]=o.useState([]),[k,p]=o.useState("");o.useEffect(()=>{(async()=>{try{const t=await g();t.code===200&&!t.error?j(t.results):console.error("Error fetching societies:",t.error)}catch(t){console.error("Error fetching societies:",t)}})()},[]);const u=s=>{l({...r,[s.target.name]:s.target.value})},S=s=>{p(s.target.value),l({...r,[s.target.name]:s.target.value})},y=async s=>{s.preventDefault(),i(null),d(!1);try{const t=await b(r);t.code===200&&!t.error?(d(!0),l({name:"",totalHouse:"",societyId:""})):i(t.message)}catch{i("Failed to create block. Please try again.")}};return e.jsx(a,{children:e.jsx(c,{xs:12,children:e.jsxs(N,{className:"mb-4",children:[e.jsx(F,{children:e.jsx("strong",{children:"Create Block"})}),e.jsxs(v,{children:[e.jsxs(H,{onSubmit:y,children:[e.jsxs(a,{className:"mb-3",children:[e.jsx(m,{htmlFor:"name",className:"col-sm-2 col-form-label",children:"Block Name"}),e.jsx(c,{sm:10,children:e.jsx(h,{type:"text",id:"name",name:"name",placeholder:"Block Name",value:r.name,onChange:u,required:!0})})]}),e.jsxs(a,{className:"mb-3",children:[e.jsx(m,{htmlFor:"totalHouse",className:"col-sm-2 col-form-label",children:"Total House"}),e.jsx(c,{sm:10,children:e.jsx(h,{type:"text",id:"totalHouse",name:"totalHouse",value:r.totalHouse,placeholder:"Total House",onChange:u,required:!0})})]}),e.jsxs(a,{className:"mb-3",children:[e.jsx(m,{htmlFor:"societyId",className:"col-sm-2 col-form-label",children:"Society"}),e.jsx(c,{sm:10,children:e.jsxs(B,{id:"societyId",name:"societyId",value:r.societyId,onChange:S,children:[e.jsx("option",{value:"",children:"Select Society"}),f.map(s=>e.jsx("option",{value:s._id,children:s.name},s._id))]})})]}),e.jsx(I,{type:"submit",color:"primary",children:"Submit"})]}),n&&e.jsx(x,{color:"danger",className:"mt-3",children:n}),C&&e.jsx(x,{color:"success",className:"mt-3",children:"Block created successfully!"})]})]})})})};export{G as default};