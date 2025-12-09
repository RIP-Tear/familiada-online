'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PiSignOutBold, PiWarningFill } from 'react-icons/pi';
import './Navbar.scss';

export default function Navbar() {
  const [showExitModal, setShowExitModal] = useState(false);
  const router = useRouter();

  const handleNavbarClick = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    router.push('/home');
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content" onClick={handleNavbarClick}>
          <span className="navbar-logo">FAMILIADA</span>
          <button className="navbar-exit-btn" onClick={handleNavbarClick}>
            <PiSignOutBold />
          </button>
        </div>
      </nav>

      {showExitModal && (
        <div className="exit-modal-overlay" onClick={handleCancelExit}>
          <div className="exit-modal-content" onClick={(e) => e.stopPropagation()}>
            <PiWarningFill className="exit-modal-icon" />
            <h2 className="exit-modal-title">Czy na pewno chcesz wyjść z gry?</h2>
            <p className="exit-modal-text">
              Opuścisz obecną grę i wrócisz do menu głównego.
              Postępy w grze nie zostaną zapisane.
            </p>
            <div className="exit-modal-buttons">
              <button className="exit-modal-btn exit-cancel" onClick={handleCancelExit}>
                Anuluj
              </button>
              <button className="exit-modal-btn exit-confirm" onClick={handleConfirmExit}>
                Tak, wyjdź
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
