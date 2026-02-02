import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { ip } from "../shrineofvsakoe/ip.jsx";


export function AddComponentPart({ onBack, onSubmit }) {
    const [formData, setFormData] = useState({
        component_model: '',
        part_type: ''
    })

    const [componentsModels, setComponentsModels] = useState([])
    const [loadingModels, setLoadingModels] = useState(false)
    const [error, setError] = useState(null)
    const {token} = useAuth();
    const [loading, setLoading] = useState(false)

    
    useEffect(() => {
        const loadComponentsModels = async () => {
            if(!token){
                setLoadingModels(false)
                return;
            }
            try {
                setLoadingModels(true)
                const responseModels = await fetch(`http://${ip}/components/`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    })


                    if (!responseModels.ok) {
                    throw new Error(`Ошибка ${responseModels.status}`)
                    }
                const responseModelsData = await responseModels.json()
                setComponentsModels(responseModelsData)
            }catch(err){
                console.error('Ошибка загрузки данных о тракторах', err)
                setError('Не удалось загрузить данные о тракторах')
            }finally{
                setLoadingModels(false)
            }


        }
        loadComponentsModels()
    }, [token]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const SubmitCompPartToServer = async () => {
        if (!token) {
            setError('Пользователь не авторизован');
            return;
        }

        try {


            const submitData = {
                component: formData.component_model,
                part_type: formData.part_type
            }

            const responseToMakeCompPart = await fetch(`http://${ip}/components/component-parts/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submitData)
            });
            if (!responseToMakeCompPart.ok) {
                    throw new Error(`Ошибка ${responseToMakeCompPart.status}`)
            }

            const responseToMakeCompPartData = await responseToMakeCompPart.json();
            if (typeof onSubmit === 'function') {
                onSubmit(responseToMakeCompPartData)
            } else if(typeof onBack ==='function') {
                onBack()
            }  
        } catch (err) {
            console.error('Ошибка при добавлении агрегата:', err);
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
                <div className='add-po-field'>
                    <label className='add-po-label'>Компонент</label>
                    <select
                        name="component_model"
                        value={formData.component_model}
                        onChange={handleChange}
                        className='add-po-select'
                        disabled={loading || loadingModels}
                        required
                    >
                        <option value="">Выберите компонент</option>
                        {loadingModels ? (
                            <option value="" disabled>Загрузка компонентов...</option>
                        ) : (
                            componentsModels.map(component => (
                                <option key={component.id} value={component.id}>
                                    {component.model} ({component.type})
                                </option>
                            ))
                        )}
                    </select>
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
                    disabled={loading || loadingModels}
                >
                    {loading ? 'Добавление...' : 'Добавить'}
                </button>
            </form>
        </div>
    );


}