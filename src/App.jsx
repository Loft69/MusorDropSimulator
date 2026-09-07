import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/header/Header.jsx";
import CasePlaceholder from "./CasePlaceholder.jsx";
import mainHtml from "./legacyMain.html?raw";

function MainWorkspace({ selectedCase, onOpenCase, onBack }) {
  const markup = useMemo(() => ({ __html: mainHtml }), []);

  useEffect(() => {
    if (selectedCase) return;

    const workspace = document.getElementById("workspace");
    if (!workspace) return;

    const handleClick = (event) => {
      const anchor = event.target.closest?.("a[href]");
      if (!anchor || !workspace.contains(anchor)) return;

      const href = anchor.getAttribute("href") || "";
      if (!/^\.\/pages\/\d+\.html$/.test(href)) return;

      event.preventDefault();
      event.stopPropagation();

      const title =
        anchor.querySelector("h2, h3")?.textContent?.trim() ||
        anchor.textContent.trim() ||
        "Кейс";

      onOpenCase({ href, title });
    };

    workspace.addEventListener("click", handleClick);
    return () => workspace.removeEventListener("click", handleClick);
  }, [selectedCase, onOpenCase]);

  return (
    <div id="workspace" className="css-e0a3cc">
      {selectedCase ? (
        <CasePlaceholder caseInfo={selectedCase} onBack={onBack} />
      ) : (
        <div dangerouslySetInnerHTML={markup} />
      )}
    </div>
  );
}

export default function App() {
  const [selectedCase, setSelectedCase] = useState(null);

  return (
    <div className="css-irwvew">
      <Header
          selectedCase={selectedCase}
          onBackRaw={() => setSelectedCase(null)}
      />
      <MainWorkspace
        selectedCase={selectedCase}
        onOpenCase={setSelectedCase}
        onBack={() => setSelectedCase(null)}
      />
    </div>
  );
}
