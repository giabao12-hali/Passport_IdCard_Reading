/* eslint-disable no-unused-vars */
import React from "react"
import { Routes, Route } from 'react-router-dom';
import Index from "./components";
import Etour from "./components/etour";
import MemberDetails from "./components/member_details";
import IdCardRead from "./components/idcard";
import PassportRead from "./components/passport";
import ListCustomers from "./components/list_customer";

function App() {
  return (
    <div className="w-full min-h-screen">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/idcard-read" element={<IdCardRead />} />
        <Route path="passport-read" element={<PassportRead />} />
        <Route path="list-customers" element={<ListCustomers />} />
        <Route path="/member-details/:bookingId/:memberId" element={<MemberDetails />} />
        <Route path="/etour" element={<Etour />} />
      </Routes>
    </div>
  );
}

export default App