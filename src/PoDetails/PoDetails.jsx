
import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import DefaultImage from '../img/default.jpg';
import KPPImage from '../img/КПП.png';
import RKImage from '../img/РК.png';
import HRImage from '../img/Гидрораспределитель.png';
import APImage from '../img/Автопилот.png';
import WeiImage from '../img/ДВС Weichai.png';
import TMZImage from '../img/ДВС ТМЗ.png';
import JMZImage from '../img/ДВС ЯМЗ.png';
import BKImage from '../img/БК дисплей контроллер.png';
import {api} from '../fetchAPI.js';


export function PoDetails({ po, onBack }) {

//      useEffect(() => {
//     const fetchFilteredData = async () => {
//       setLoading(true);
//       setError(null);

//       if (!token) {
//         setError('Пользователь не авторизован');
//         setLoading(false);
//         return;
//       }
//       if (userRole !== 'dealer') {
//         try {
//           const FilterToTypeMap = {
//             DVS: ['dvs', 'engine'],
//             KPP: ['kpp', 'transmission'],
//             RK: ['suspension'],
//             hydrorasp: ['hydraulics'],
//           };
//           const FilterToTractor = { K7: 'K-7', K5: 'K-5' };

//           const postData = {
//             trac_model: activeFilters2.map(f => FilterToTractor[f] || f),
//             type_comp: activeFilters.flatMap(f => FilterToTypeMap[f] || f),
//             model_comp: Array.isArray(selectedModel) ? selectedModel : [],
//             producers: Array.isArray(selectedProducers) ? selectedProducers : [],
//             status: Array.isArray(selectedStatus) ? selectedStatus : [],

//           };


//           const data = await api.post('search/component-info', postData);

//           const items = Array.isArray(data) ? data : data ? [data] : [];
//           setSoftwareItems(items);
//         } catch (err) {
//           console.error('Ошибка:', err);
//           setError(`Ошибка: ${err.message}`);
//         } finally {
//           setLoading(false);
//         }
//       } else {
//         setLoading(false);
//       }
//     };

//     fetchFilteredData();
//   }, [activeFilters, activeFilters2, selectedModel, selectedProducers, token, searchQuery, selectedStatus]); 


    const ImageToComponent = (type_component, model_component) => {
      // Приводим типы к нижнему регистру для единообразия
      const typeLower = type_component?.toLowerCase() || '';
      const modelLower = model_component?.toLowerCase() || '';
    
      // Обработка КПП в первую очередь (и по типу, и по модели)
      if (typeLower.includes('кпп') || typeLower.includes('kpp') || 
          modelLower.includes('кпп') || modelLower.includes('kpp')) {
        return KPPImage;
      }
    
      // Обработка остальных компонентов по типу
      if (typeLower && typeLower !== 'двс') {
        const ImageByType = {
          'рулевая колонка': RKImage,
          'гидрораспределитель': HRImage,
          'бк': BKImage,
          'автопилот': APImage,
        };
        
        // Ищем соответствие по ключевым словам
        for (const [key, image] of Object.entries(ImageByType)) {
          if (typeLower.includes(key)) {
            return image;
          }
        }
      }
    
      // Обработка ДВС по модели
      if (typeLower === 'двс' && modelLower) {
        if (modelLower.includes('weichai')) {
          return WeiImage;
        }
        if (modelLower.includes('тмз') || modelLower.includes('tmz')) {
          return TMZImage;
        }
        if (modelLower.includes('ямз') || modelLower.includes('yamz') || modelLower.includes('ymz')) {
          return JMZImage;
        }
      }
    
      return DefaultImage;
    };
    


  return (
    <div className="po-details-container">
      <button onClick={onBack} className="add-po-back-button">
        <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22L2 12L12 2M26 22L16 12L26 2" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
       <div className="po-details-content">
        <div className="left-column">
            <div className="section">
               <h2>№: {po.producer_version} от {new Date(po.release_date).toLocaleDateString()} </h2>
               <img className="object"
                      src={ImageToComponent(po.type_component, po.model_component || po.comp_model)}
                      alt={po.type_component} />
            </div>
            <div className="section">
               <h3>Дата выпуска</h3>
              <p>{po.release_date ? new Date(po.release_date).toLocaleDateString('ru-RU') : '-'}</p>
            </div>
        </div>
        <div className="right-column">
            <h3>fdsdfxfxdfxfd</h3>
        </div>
    </div>
      
    </div>
  );
}