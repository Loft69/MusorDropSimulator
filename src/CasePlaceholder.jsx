import React from "react";

export default function CasePlaceholder({ caseInfo, onBack }) {
  return (
    <div className="case-workspace">
      <div className="case-workspace__inner">
        <div className="case-workspace__content">
          <span className="case-workspace__badge">CASE WORKSPACE</span>
          <h1>{caseInfo.title}</h1>
          <p>Здесь будет содержимое кейса.</p>
          <span>{caseInfo.href}</span>
        </div>
      </div>
    </div>
  );
}
