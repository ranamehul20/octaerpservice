import{w as r}from"./index-BOQoDeiJ.js";const s="http://localhost:5001/api",c=async()=>{try{const t=await r.get(`${s}/societies`,{withCredentials:!0});return console.log("Success",t),t.data}catch{throw error}},n=async t=>{try{const e=await await r.post(`${s}/societies`,t,{headers:{"Content-Type":"multipart/form-data"},withCredentials:!0});return console.log("Success",e),e.data}catch{throw error}},i=async(t,e)=>{try{const o=await r.post(`${s}/societies/${t}`,e,{headers:{"Content-Type":"multipart/form-data"},withCredentials:!0});return console.log("Success",o),o.data}catch{throw error}},u=async t=>{try{const e=await r.get(`${s}/societies/${t}`,{withCredentials:!0});return console.log("Success",e),e.data}catch{throw error}},l=async t=>{try{const e=await r.get(`${s}/config/city?state=${t}`,{withCredentials:!0});return console.log("Success",e),e.data}catch{throw error}},h=async t=>{try{const e=await r.get(`${s}/config/state?country=${t}`,{withCredentials:!0});return console.log("Success",e),e.data}catch{throw error}},w=async()=>{try{const t=await r.get(`${s}/config/country`,{withCredentials:!0});return console.log("Success",t),t.data}catch{throw error}};export{h as a,l as b,n as c,w as g,c as l,i as u,u as v};
