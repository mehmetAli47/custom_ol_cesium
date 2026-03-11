import React, { useState } from 'react';

interface AddDataPanelProps {
    onAdd: (name: string, url: string, type: 'XYZ' | 'WMS' | 'GeoJSON', wmsLayers?: string) => void;
}

const AddDataPanel: React.FC<AddDataPanelProps> = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [type, setType] = useState<'XYZ' | 'WMS' | 'GeoJSON'>('XYZ');
    const [wmsLayers, setWmsLayers] = useState('0');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !url) return;
        onAdd(name, url, type, type === 'WMS' ? wmsLayers : undefined);
        setName('');
        setUrl('');
    };

    return (
        <div className="add-data-panel">
            <h3>Add Data Layer</h3>
            <form onSubmit={handleSubmit} className="add-data-form">
                <div className="input-group">
                    <label>Layer Name</label>
                    <input
                        type="text"
                        placeholder="e.g. My GeoJSON"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>URL</label>
                    <input
                        type="text"
                        placeholder="https://..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value as any)}>
                        <option value="XYZ">XYZ / Tiles</option>
                        <option value="WMS">WMS</option>
                        <option value="GeoJSON">GeoJSON</option>
                    </select>
                </div>
                {type === 'WMS' && (
                    <div className="input-group animate-fade-in">
                        <label>WMS Layers (Comma separated)</label>
                        <input
                            type="text"
                            placeholder="e.g. topp:states,0"
                            value={wmsLayers}
                            onChange={(e) => setWmsLayers(e.target.value)}
                        />
                    </div>
                )}
                <button type="submit" className="add-btn">
                    Add to Map
                </button>
            </form>
            <div className="panel-hint">
                Add remote data URLs to sync across 2D and 3D views instantly.
            </div>
        </div>
    );
};

export default AddDataPanel;
