import { useState } from 'react';
import Select from 'react-select';

// 🔥 ДАННЫЕ-ЗАГЛУШКА ДЛЯ КОМПОНЕНТОВ
const MOCK_COMPONENTS = [
    { id: 1, model: 'ДВС Cummins X15', type: 'dvs' },
    { id: 2, model: 'КПП Allison 4500', type: 'kpp' },
    { id: 3, model: 'РК Eaton Fuller', type: 'rk' },
    { id: 4, model: 'Гидрораспределитель Bosch', type: 'hydro' },
    { id: 5, model: 'ДВС Deutz TCD 6.1', type: 'dvs' },
    { id: 6, model: 'КПП ZF 16S', type: 'kpp' },
    { id: 7, model: 'РК Dana Spicer', type: 'rk' },
    { id: 8, model: 'ДВС ЯМЗ-536', type: 'dvs' },
];

// Функция для преобразования типа компонента (вынесена за компонент)
const getComponentTypeName = (type) => {
    const typeNames = {
        'dvs': 'ДВС',
        'kpp': 'КПП',
        'rk': 'РК',
        'hydro': 'Гидрораспределитель'
    }
    return typeNames[type] || type
}

export function AddComponentPart({ onBack, onSubmit }) {
    const [formData, setFormData] = useState({
        component_model: '',
        part_type: ''
    })

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    // Для react-select - выносим преобразование данных в отдельную переменную
    const componentOptions = MOCK_COMPONENTS.map(component => ({
        value: component.id,
        label: `${component.model} (${getComponentTypeName(component.type)})`
    }))

    const [selectedComponent, setSelectedComponent] = useState(null)

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Обработчик выбора компонента через react-select
    const handleComponentSelectChange = (selectedOption) => {
        setSelectedComponent(selectedOption);
        setFormData(prev => ({
            ...prev,
            component_model: selectedOption ? selectedOption.value : ''
        }));
    };

    const SubmitCompPartToServer = async () => {
        if (!formData.component_model) {
            setError('Выберите компонент');
            return;
        }
        if (!formData.part_type) {
            setError('Введите тип части');
            return;
        }

        try {
            setLoading(true);
            
            // Имитация отправки данных
            const submitData = {
                component: formData.component_model,
                part_type: formData.part_type
            }

            console.log('Данные для отправки:', submitData);
            
            // Здесь будет реальный запрос к API
            // const response = await fetch(...)
            
            // Имитация успешного ответа
            const mockResponse = {
                id: Date.now(),
                ...submitData,
                created_at: new Date().toISOString()
            };

            if (typeof onSubmit === 'function') {
                onSubmit(mockResponse)
            } else if(typeof onBack ==='function') {
                onBack()
            }  
        } catch (err) {
            console.error('Ошибка при добавлении части агрегата:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        SubmitCompPartToServer();
    };

    return (
        <div className="add-po-comp-part-container">
            <button
                onClick={onBack}
                className="add-po-back-button"
                disabled={loading}
            >
                <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22L2 12L12 2M26 22L16 12L26 2" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            <h3 className="add-po-title">Добавление части агрегата</h3>

            {error && (
                <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>
                    {error}
                </div>
            )}

            <form className="add-po-form" onSubmit={handleSubmit}>
                {/* 🔥 Выбор компонента через react-select с данными-заглушкой */}
                <div className="add-po-field">
                    <label className="add-po-label">Компонент</label>
                    <Select
                        options={componentOptions}
                        value={selectedComponent}
                        onChange={handleComponentSelectChange}
                        placeholder="Выберите компонент"
                        classNamePrefix="add-po-select"
                        isClearable={true}
                        isSearchable={true}
                        noOptionsMessage={() => "Нет доступных компонентов"}
                        
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                height: '40px',
                                minHeight: '40px',
                                width: '100%',
                                border: '1px solid',
                                borderColor: state.isFocused ? '#13be00' : '#ccc',
                                boxSizing: 'border-box',
                                padding: '0 12px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                transition: 'border-color 0.15s ease',
                                outline: 'none',
                                boxShadow: 'none',
                                '&:hover': {
                                    borderColor: '#13be00'
                                }
                            }),
                            menuList: (base) => ({
                                ...base,
                                maxHeight: 200,
                                padding: '4px 0',
                                backgroundColor: 'white'
                            }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isSelected ? '#13be00' : 
                                                state.isFocused ? '#f0f9ff' : 'white',
                                color: state.isSelected ? 'white' : '#1E1E1E',
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: '#f0f9ff'
                                }
                            }),
                            singleValue: (base) => ({
                                ...base,
                                color: '#1E1E1E'
                            }),
                            placeholder: (base) => ({
                                ...base,
                                color: '#999'
                            })
                        }}
                    />
                </div>

                <div className='add-po-field'>
                    <label className='add-po-label'>Тип части</label>
                    <input
                        type="text"
                        name="part_type"
                        placeholder="Введите тип части агрегата"
                        value={formData.part_type}
                        onChange={handleChange}
                        className='add-po-input'
                        disabled={loading}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className='add-po-submit-button'
                    disabled={loading}
                >
                    {loading ? 'Добавление...' : 'Добавить'}
                </button>
            </form>
        </div>
    );
}









// import { useEffect, useState } from 'react';
// import { useAuth } from '../auth/AuthContext.jsx';
// import { ip } from "../shrineofvsakoe/ip.jsx";
// import Select from 'react-select';

// export function AddComponentPart({ onBack, onSubmit }) {
//     const [formData, setFormData] = useState({
//         component_model: '',
//         part_type: ''
//     })

//     const [componentsModels, setComponentsModels] = useState([])
//     const [loadingModels, setLoadingModels] = useState(false)
//     const [error, setError] = useState(null)
//     const {token} = useAuth();
//     const [loading, setLoading] = useState(false)

//     // Для react-select
//     const [componentOptions, setComponentOptions] = useState([])
//     const [selectedComponent, setSelectedComponent] = useState(null)
    
//     useEffect(() => {
//         const loadComponentsModels = async () => {
//             if(!token){
//                 setLoadingModels(false)
//                 return;
//             }
//             try {
//                 setLoadingModels(true)
//                 const responseModels = await fetch(`http://${ip}/components/`, {
//                         method: 'GET',
//                         headers: {
//                             'Authorization': `Bearer ${token}`,
//                             'Accept': 'application/json',
//                             'Content-Type': 'application/json'
//                         }
//                     })

//                     if (!responseModels.ok) {
//                     throw new Error(`Ошибка ${responseModels.status}`)
//                     }
//                 const responseModelsData = await responseModels.json()
//                 setComponentsModels(responseModelsData)
                
//                 // Преобразуем данные для react-select
//                 const options = responseModelsData.map(component => ({
//                     value: component.id,
//                     label: `${component.model} (${component.type})`
//                 }))
//                 setComponentOptions(options)
                
//             }catch(err){
//                 console.error('Ошибка загрузки данных о компонентах', err)
//                 setError('Не удалось загрузить данные о компонентах')
//             }finally{
//                 setLoadingModels(false)
//             }
//         }
//         loadComponentsModels()
//     }, [token]);


//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     // Обработчик выбора компонента через react-select
//     const handleComponentSelectChange = (selectedOption) => {
//         setSelectedComponent(selectedOption);
//         setFormData(prev => ({
//             ...prev,
//             component_model: selectedOption ? selectedOption.value : ''
//         }));
//     };

//     const SubmitCompPartToServer = async () => {
//         if (!token) {
//             setError('Пользователь не авторизован');
//             return;
//         }

//         try {
//             const submitData = {
//                 component: formData.component_model,
//                 part_type: formData.part_type
//             }

//             const responseToMakeCompPart = await fetch(`http://${ip}/components/component-parts/`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Accept': 'application/json',
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(submitData)
//             });
//             if (!responseToMakeCompPart.ok) {
//                     throw new Error(`Ошибка ${responseToMakeCompPart.status}`)
//             }

//             const responseToMakeCompPartData = await responseToMakeCompPart.json();
//             if (typeof onSubmit === 'function') {
//                 onSubmit(responseToMakeCompPartData)
//             } else if(typeof onBack ==='function') {
//                 onBack()
//             }  
//         } catch (err) {
//             console.error('Ошибка при добавлении части агрегата:', err);
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     }

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         SubmitCompPartToServer();
//     };

//     return (
//         <div className="add-po-comp-part-container">
//             <button
//                 onClick={onBack}
//                 className="add-po-back-button"
//                 disabled={loading}
//             >
//                 <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M12 22L2 12L12 2M26 22L16 12L26 2" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//             </button>

//             <h3 className="add-po-title">Добавление части агрегата</h3>

//             {error && (
//                 <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>
//                     {error}
//                 </div>
//             )}

//             <form className="add-po-form" onSubmit={handleSubmit}>
//                 {/* 🔥 Выбор компонента через react-select */}
//                 <div className="add-po-field">
//                     <label className="add-po-label">Компонент</label>
//                     <Select
//                         options={componentOptions}
//                         value={selectedComponent}
//                         onChange={handleComponentSelectChange}
//                         placeholder={loadingModels ? "Загрузка компонентов..." : "Выберите компонент"}
//                         classNamePrefix="add-po-select"
//                         isClearable={true}
//                         isSearchable={true}
//                         isLoading={loadingModels}
//                         noOptionsMessage={() => "Нет доступных компонентов"}
                        
//                         styles={{
//                             control: (base, state) => ({
//                                 ...base,
//                                 height: '40px',
//                                 minHeight: '40px',
//                                 width: '100%',
//                                 border: '1px solid',
//                                 borderColor: state.isFocused ? '#13be00' : '#ccc',
//                                 boxSizing: 'border-box',
//                                 padding: '0 12px',
//                                 fontSize: '16px',
//                                 cursor: 'pointer',
//                                 transition: 'border-color 0.15s ease',
//                                 outline: 'none',
//                                 boxShadow: 'none',
//                                 '&:hover': {
//                                     borderColor: '#13be00'
//                                 }
//                             }),
//                             menuList: (base) => ({
//                                 ...base,
//                                 maxHeight: 200,
//                                 padding: '4px 0',
//                                 backgroundColor: 'white'
//                             }),
//                             option: (base, state) => ({
//                                 ...base,
//                                 backgroundColor: state.isSelected ? '#13be00' : 
//                                                 state.isFocused ? '#f0f9ff' : 'white',
//                                 color: state.isSelected ? 'white' : '#1E1E1E',
//                                 cursor: 'pointer',
//                                 '&:hover': {
//                                     backgroundColor: '#f0f9ff'
//                                 }
//                             }),
//                             singleValue: (base) => ({
//                                 ...base,
//                                 color: '#1E1E1E'
//                             }),
//                             placeholder: (base) => ({
//                                 ...base,
//                                 color: '#999'
//                             })
//                         }}
//                     />
//                 </div>

//                 <div className='add-po-field'>
//                     <label className='add-po-label'>Тип части</label>
//                     <input
//                         type="text"
//                         name="part_type"
//                         placeholder="Введите тип части агрегата"
//                         value={formData.part_type}
//                         onChange={handleChange}
//                         className='add-po-input'
//                         disabled={loading}
//                         required
//                     />
//                 </div>

//                 <button
//                     type="submit"
//                     className='add-po-submit-button'
//                     disabled={loading || loadingModels}
//                 >
//                     {loading ? 'Добавление...' : 'Добавить'}
//                 </button>
//             </form>
//         </div>
//     );
// }