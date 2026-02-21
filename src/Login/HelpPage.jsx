import {useNavigate} from 'react-router-dom';
import HelpImage from '../img/помощь.jpg';
export function HelpPage () {
   const navigate = useNavigate();
   const handleBack = () => {
      navigate(-1);
   }
   return <div className = "formHelp">
        <button onClick={handleBack} className="add-po-back-button">
          <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22L2 12L12 2M26 22L16 12L26 2" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className = "textHelp">
          В разработке
          </div>
      
      </div>; 
}
