'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PiSignOutBold, PiWarningFill, PiCheckBold, PiXBold } from 'react-icons/pi';
import Modal from './Modal';
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

      <Modal isOpen={showExitModal} onClose={handleCancelExit}>
        <div className="modal-icon">
          <PiWarningFill />
        </div>
        <h2 className="modal-title">Czy na pewno chcesz wyjść z gry?</h2>
        <p className="modal-text">
          Opuścisz obecną grę i wrócisz do menu głównego.
          Postępy w grze nie zostaną zapisane.
        </p>
        <div className="modal-buttons">
          <button className="modal-btn btn-cancel" onClick={handleCancelExit}>
            <PiXBold /> Anuluj
          </button>
          <button className="modal-btn btn-confirm" onClick={handleConfirmExit}>
            <PiCheckBold /> Tak, wyjdź
          </button>
        </div>
      </Modal>
    </>
  );
}
