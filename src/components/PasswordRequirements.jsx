import React from 'react';
import { IoCheckmarkCircle, IoEllipseOutline } from 'react-icons/io5';
import { checkPassword } from '../utils/passwordPolicy';

export default function PasswordRequirements({ password }) {
  const { results } = checkPassword(password);

  return (
    <ul className="req-list">
      {results.map((r) => (
        <li key={r.key} className={`req-item${r.met ? ' met' : ''}`}>
          {r.met ? <IoCheckmarkCircle size={16} /> : <IoEllipseOutline size={16} />}
          <span>{r.label}</span>
        </li>
      ))}
    </ul>
  );
}
