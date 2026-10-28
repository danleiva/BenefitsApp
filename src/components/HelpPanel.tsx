import { stateByCode } from '../data/states';
import { isSurvivor } from '../engine/rules';
import type { Profile } from '../types';

export function HelpPanel({ profile }: { profile: Profile }) {
  const st = stateByCode(profile.state);
  const near = profile.zip ? `?address=${profile.zip}` : '';
  return (
    <aside className="help-panel" aria-labelledby="help-title">
      <h2 id="help-title">Get free help</h2>
      <ul className="help-list">
        {isSurvivor(profile) && (
          <li>
            <strong>TAPS survivor helpline (24/7)</strong>
            <span>Free grief support and help navigating survivor benefits.</span>
            <a href="tel:18009598277">1-800-959-8277</a>
          </li>
        )}
        <li>
          <strong>Free claims help</strong>
          <span>Accredited Veterans Service Officers (VSOs) help you file for free.</span>
          <a href="https://www.va.gov/get-help-from-accredited-representative/find-rep/" target="_blank" rel="noopener noreferrer">
            Find a representative ↗
          </a>
        </li>
        {st && (
          <li>
            <strong>{st.agency}</strong>
            <span>State programs and county veterans service officers.</span>
            <a href={st.url} target="_blank" rel="noopener noreferrer">
              Visit website ↗
            </a>
          </li>
        )}
        <li>
          <strong>VA benefits hotline</strong>
          <span>Mon–Fri, 8 a.m.–9 p.m. ET</span>
          <a href="tel:18008271000">1-800-827-1000</a>
        </li>
        <li>
          <strong>VA locations{profile.zip ? ` near ${profile.zip}` : ''}</strong>
          <span>Medical centers, clinics, Vet Centers, and regional offices.</span>
          <a href={`https://www.va.gov/find-locations/${near}`} target="_blank" rel="noopener noreferrer">
            Find locations ↗
          </a>
        </li>
        <li>
          <strong>Get your records</strong>
          <span>Request your DD-214 and military personnel file.</span>
          <a href="https://www.archives.gov/veterans/military-service-records" target="_blank" rel="noopener noreferrer">
            National Archives ↗
          </a>
        </li>
      </ul>
      <div className="warning-note">
        <strong>Never pay to file a VA claim.</strong> Only VA-accredited representatives can help with claims, and VSOs do it
        for free. Be cautious of “claim consultants” who charge fees.
      </div>
    </aside>
  );
}
