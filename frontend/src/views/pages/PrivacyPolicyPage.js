// PrivacyPolicyPage.js
import React from 'react';
import { CCard, CCardBody, CCardHeader, CContainer, CRow, CCol } from '@coreui/react';

const PrivacyPolicyPage = () => {
console.log("privacy page")
  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={10} lg={8}>
          <CCard>
            <CCardHeader>
              <h3>Privacy Policy</h3>
            </CCardHeader>
            <CCardBody>
              <section>
                <h5>Introduction</h5>
                <p>
                  Welcome to Octa ERP Services. Your privacy is important to us. This policy outlines the
                  types of personal information we collect, how we use it, and the measures we take to protect it.
                </p>
              </section>

              <section>
                <h5>Information We Collect</h5>
                <ul>
                  <li>Personal identification information: Name, email address, phone number, etc.</li>
                  <li>Transaction data: Payment history, invoices, and other billing details.</li>
                  <li>Usage data: Logins, page visits, and other interaction metrics.</li>
                </ul>
              </section>

              <section>
                <h5>How We Use Your Information</h5>
                <p>
                  We use the collected data to:
                </p>
                <ul>
                  <li>Manage and maintain your society accounts.</li>
                  <li>Send notifications, updates, and reminders.</li>
                  <li>Enhance the user experience and improve our services.</li>
                  <li>Ensure compliance with legal obligations.</li>
                </ul>
              </section>

              <section>
                <h5>Data Sharing and Security</h5>
                <p>
                  We do not sell or share your data with third parties except when required by law. We implement robust security
                  measures to protect your information from unauthorized access, disclosure, or destruction.
                </p>
              </section>

              <section>
                <h5>Your Rights</h5>
                <p>
                  You have the right to:
                </p>
                <ul>
                  <li>Access and update your personal information.</li>
                  <li>Request data deletion, subject to applicable laws.</li>
                  <li>Opt out of marketing communications.</li>
                </ul>
              </section>

              <section>
                <h5>Contact Us</h5>
                <p>
                  If you have any questions or concerns about this privacy policy, please contact us at:
                  <br />
                  Email: bussiness@octaerpservice.com
                  <br />
                  Phone: +919662654573
                </p>
              </section>

              <section>
                <h5>Changes to This Policy</h5>
                <p>
                  We reserve the right to update this privacy policy at any time. Changes will be effective immediately upon posting
                  on this page. Please check back regularly to stay informed.
                </p>
              </section>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default PrivacyPolicyPage;
