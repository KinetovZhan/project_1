import Select from 'react-select';


const options = [{value: '', label:'Все модели'}, ...componentModels.map(item => ({ value: item, label: item }))];

export function Selector() {
    <div className='model'>
        <Select
            options={options}
            value={options.find(opt => opt.value === selectedModel) || null}
            onChange={(opt) => {
            const val = opt?.value || '';
            setSelectedModel(val);
            onModelChange?.(val);
            }}
            placeholder="Модель"
            isDisabled={loading || componentModels.length === 0}
            styles={{ 
            control: (base) => ({ ...base, maxHeight: 150, overflowY: 'auto', color: 'black', backgroundColor:'rgba(217, 217, 217, 1)', width:'200px', borderRadius: '25px', height:'53px'}),
            menuList: (base) => ({ ...base, maxHeight: 150, overflowY: 'auto', backgroundColor:'rgba(217, 217, 217, 1)',color:'black', border: '1px solid rgba(217, 217, 217, 1)',scrollbarWidth:'thin'}),
            }}
        />
    </div>
}