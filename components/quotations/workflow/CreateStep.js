"use client";
import { useState } from 'react';
import { Plus, Trash2, AlertCircle, User, Mail, Phone, Building2, Loader2, Check, CreditCard, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ServiceCatalog from './ServiceCatalog';

export default function CreateStep({ data, clients, onChange, onNext, onQuotationSaved }) {
  const [clientType, setClientType] = useState('new');
  const [loading, setLoading] = useState(false);
  const [gstEnabled, setGstEnabled] = useState(true);

  const updateData = (updates) => {
    onChange({ ...data, ...updates });
  };

  const addService = () => {
    const newService = {
      id: `s${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
    };
    updateData({ services: [...data.services, newService] });
  };

  const removeService = (id) => {
    updateData({ services: data.services.filter(s => s.id !== id) });
  };

  const updateService = (id, field, value) => {
    updateData({
      services: data.services.map(s =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    });
  };

  const addServiceFromCatalog = (service) => {
    const newService = {
      id: `s${Date.now()}`,
      name: service.name,
      description: service.description,
      quantity: 1,
      unitPrice: service.rate,
      discount: 0,
    };
    updateData({ services: [...data.services, newService] });
    toast.success(`Added ${service.name}`);
  };

  const toggleAddOn = (id) => {
    updateData({
      addOns: (data.addOns || []).map(a =>
        a.id === id ? { ...a, selected: !a.selected } : a
      ),
    });
  };

  const addNewAddOn = () => {
    const newAddOn = {
      id: `ao${Date.now()}`,
      name: '',
      price: 0,
      selected: true,
    };
    updateData({ addOns: [...(data.addOns || []), newAddOn] });
  };

  const removeAddOn = (id) => {
    updateData({ addOns: (data.addOns || []).filter(a => a.id !== id) });
  };

  const updateAddOn = (id, field, value) => {
    updateData({
      addOns: (data.addOns || []).map(a =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    });
  };

  const calculateTotals = () => {
    // Calculate service subtotal
    let subtotal = 0;
    data.services.forEach(service => {
      const itemTotal = service.quantity * service.unitPrice * (1 - service.discount / 100);
      subtotal += itemTotal;
    });
    
    // Calculate add-ons total (with safety check)
    const addOnsTotal = (data.addOns || []).filter(a => a.selected).reduce((sum, a) => sum + a.price, 0);
    
    // Overall cost (before discount)
    const overallCost = subtotal + addOnsTotal;
    
    // After discount (Offered Price)
    const offeredPrice = overallCost - (data.discount || 0);
    
    // Tax amount (only if GST is enabled)
    const taxAmount = gstEnabled ? (offeredPrice * (data.taxRate / 100)) : 0;
    
    // Final quotation amount
    const totalAmount = offeredPrice + taxAmount;
    
    return { subtotal, addOnsTotal, overallCost, offeredPrice, taxAmount, totalAmount };
  };

  const { subtotal, addOnsTotal, overallCost, offeredPrice, taxAmount, totalAmount } = calculateTotals();

  const handleSaveAndPreview = async () => {
    // Validation
    if (!data.clientName || !data.clientEmail) {
      toast.error('Client name and email are required');
      return;
    }
    if (!data.projectTitle) {
      toast.error('Project title is required');
      return;
    }
    if (data.services.length === 0 || !data.services[0].name) {
      toast.error('At least one service is required');
      return;
    }

    setLoading(true);
    try {
      // Prepare quotation data
      const quotationData = {
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        companyName: data.clientCompany,
        gstNumber: data.gstNumber,
        billingAddress: data.clientAddress ? {
          street: data.clientAddress,
        } : undefined,
        projectTitle: data.projectTitle,
        projectDescription: data.projectDescription,
        services: data.services.map(s => {
          const total = s.quantity * s.unitPrice * (1 - s.discount / 100);
          return {
            name: s.name,
            description: s.description,
            quantity: s.quantity,
            unitPrice: s.unitPrice,
            discount: s.discount,
            total: total,
          };
        }),
        addOns: data.addOns || [],
        subtotal: subtotal,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        taxRate: data.taxRate,
        validTill: data.validUntil,
        paymentTerms: '50% advance, 50% on completion',
        notes: data.notes,
        status: 'draft',
        razorpayEnabled: data.razorpayEnabled || false,
      };

      // Check if we're editing or creating
      const isEditing = data._id;
      const url = isEditing ? `/api/quotations/${data._id}` : '/api/quotations';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotationData),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(isEditing ? 'Quotation updated successfully!' : 'Quotation created successfully!');
        onQuotationSaved(result.data);
        onNext();
      } else {
        toast.error(result.error || `Failed to ${isEditing ? 'update' : 'create'} quotation`);
      }
    } catch (error) {
      console.error('Error saving quotation:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Sidebar */}
      <div className="lg:col-span-1 space-y-5">
        {/* Client Type Selection */}
        <div className="bg-white border-2 border-[#1a1a2e] p-5">
          <h3 className="font-black uppercase tracking-widest text-sm text-[#1a1a2e] mb-4 border-b-2 border-[#e8b86d] pb-2">
            Client Type
          </h3>
          <div className="space-y-2">
            {[
              { value: 'existing', label: 'Existing Client', desc: 'Select from database' },
              { value: 'new', label: 'New/Immediate Client', desc: 'Enter details manually' },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setClientType(type.value)}
                className={`w-full text-left p-3 border-2 transition-all ${
                  clientType === type.value
                    ? 'border-[#1a1a2e] bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    clientType === type.value ? 'border-[#1a1a2e]' : 'border-gray-300'
                  }`}>
                    {clientType === type.value && (
                      <div className="w-2 h-2 rounded-full bg-[#1a1a2e]"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#1a1a2e]">{type.label}</div>
                    <div className="text-xs text-gray-500">{type.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Client Details */}
        <div className="bg-white border-2 border-[#1a1a2e] p-5">
          <h3 className="font-black uppercase tracking-widest text-sm text-[#1a1a2e] mb-4 border-b-2 border-[#e8b86d] pb-2">
            Client Details
          </h3>
          <div className="space-y-3">
            {clientType === 'existing' ? (
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                  Select Client *
                </label>
                <select
                  value={data.client || ''}
                  onChange={(e) => {
                    const client = clients.find(c => c._id === e.target.value);
                    if (client) {
                      updateData({
                        client: client._id,
                        clientName: client.name,
                        clientEmail: client.email,
                        clientPhone: client.phone,
                        clientCompany: client.companyName,
                        gstNumber: client.gstNumber,
                        clientAddress: client.billingAddress?.street || '',
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-200 text-sm focus:outline-none focus:border-[#1a1a2e]"
                >
                  <option value="">Choose a client</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.name} {client.companyName ? `- ${client.companyName}` : ''} ({client.email})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                {[
                  { field: 'clientName', label: 'Full Name *', icon: User, placeholder: 'John Doe' },
                  { field: 'clientEmail', label: 'Email *', icon: Mail, placeholder: 'john@example.com', type: 'email' },
                  { field: 'clientPhone', label: 'Phone', icon: Phone, placeholder: '+91 98765 43210' },
                  { field: 'clientCompany', label: 'Company', icon: Building2, placeholder: 'Acme Corp' },
                ].map(({ field, label, icon: Icon, placeholder, type }) => (
                  <div key={field}>
                    <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                      <Icon size={12} className="inline mr-1" />
                      {label}
                    </label>
                    <input
                      type={type || 'text'}
                      value={data[field] || ''}
                      onChange={(e) => updateData({ [field]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 border-2 border-gray-200 text-sm focus:outline-none focus:border-[#1a1a2e]"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                    GST Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={data.gstNumber || ''}
                    onChange={(e) => updateData({ gstNumber: e.target.value.toUpperCase() })}
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full px-3 py-2 border-2 border-gray-200 text-sm focus:outline-none focus:border-[#1a1a2e]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                    Address
                  </label>
                  <textarea
                    value={data.clientAddress || ''}
                    onChange={(e) => updateData({ clientAddress: e.target.value })}
                    placeholder="Client address..."
                    className="w-full px-3 py-2 border-2 border-gray-200 text-sm focus:outline-none focus:border-[#1a1a2e] resize-none"
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Add-ons */}
        <div className="bg-white border-2 border-[#1a1a2e] p-5">
          <div className="flex items-center justify-between mb-1 border-b-2 border-[#e8b86d] pb-2">
            <h3 className="font-black uppercase tracking-widest text-sm text-[#1a1a2e]">
              Add-Ons & Extras
            </h3>
            <button
              type="button"
              onClick={addNewAddOn}
              className="text-xs font-black uppercase tracking-widest bg-[#1a1a2e] text-[#e8b86d] px-3 py-1.5 hover:bg-[#e8b86d] hover:text-[#1a1a2e] transition-colors"
            >
              <Plus size={14} className="inline mr-1" />
              Add
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-4">Customize the package</p>
          <div className="space-y-2">
            {(data.addOns || []).map(addOn => (
              <div
                key={addOn.id}
                className={`p-3 border-2 transition-colors ${
                  addOn.selected ? 'border-[#e8b86d] bg-amber-50' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={addOn.selected}
                    onChange={() => toggleAddOn(addOn.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={addOn.name}
                      onChange={(e) => updateAddOn(addOn.id, 'name', e.target.value)}
                      placeholder="Add-on name"
                      className="w-full px-2 py-1 border text-xs font-bold focus:outline-none focus:border-[#1a1a2e]"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Price:</span>
                      <input
                        type="number"
                        value={addOn.price}
                        onChange={(e) => updateAddOn(addOn.id, 'price', parseFloat(e.target.value) || 0)}
                        min="0"
                        placeholder="0"
                        className="w-24 px-2 py-1 border text-xs text-right focus:outline-none focus:border-[#1a1a2e]"
                      />
                      <span className="text-xs text-gray-500">
                        {addOn.price === 0 ? (
                          <span className="text-green-600 font-bold">FREE ✓</span>
                        ) : (
                          `₹${addOn.price.toLocaleString()}`
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAddOn(addOn.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-2 space-y-5">
        {/* Service Catalog */}
        <ServiceCatalog onAddService={addServiceFromCatalog} />

        {/* Project Details */}
        <div className="bg-white border-2 border-[#1a1a2e] p-5">
          <h3 className="font-black uppercase tracking-widest text-sm text-[#1a1a2e] mb-4 border-b-2 border-[#e8b86d] pb-2">
            Project Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                value={data.projectTitle || ''}
                onChange={(e) => updateData({ projectTitle: e.target.value })}
                placeholder="E.g., E-commerce Website Development"
                className="w-full px-3 py-2 border-2 border-gray-200 text-sm focus:outline-none focus:border-[#1a1a2e]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                Valid Till *
              </label>
              <input
                type="date"
                value={data.validUntil || ''}
                onChange={(e) => updateData({ validUntil: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 text-sm focus:outline-none focus:border-[#1a1a2e]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                PO Number (Optional)
              </label>
              <input
                type="text"
                value={data.poNumber || ''}
                onChange={(e) => updateData({ poNumber: e.target.value })}
                placeholder="Purchase Order Number"
                className="w-full px-3 py-2 border-2 border-gray-200 text-sm focus:outline-none focus:border-[#1a1a2e]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                Delivery Timeline
              </label>
              <input
                type="text"
                value={data.deliveryTimeline || ''}
                onChange={(e) => updateData({ deliveryTimeline: e.target.value })}
                placeholder="E.g., 4-6 weeks"
                className="w-full px-3 py-2 border-2 border-gray-200 text-sm focus:outline-none focus:border-[#1a1a2e]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                Project Description
              </label>
              <textarea
                value={data.projectDescription || ''}
                onChange={(e) => updateData({ projectDescription: e.target.value })}
                placeholder="Brief description of the project..."
                className="w-full px-3 py-2 border-2 border-gray-200 text-sm focus:outline-none focus:border-[#1a1a2e] resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white border-2 border-[#1a1a2e] p-5">
          <div className="flex items-center justify-between mb-4 border-b-2 border-[#e8b86d] pb-2">
            <h3 className="font-black uppercase tracking-widest text-sm text-[#1a1a2e]">
              Services / Line Items
            </h3>
            <button
              onClick={addService}
              className="text-xs font-black uppercase tracking-widest bg-[#1a1a2e] text-[#e8b86d] px-3 py-1.5 hover:bg-[#e8b86d] hover:text-[#1a1a2e] transition-colors"
            >
              <Plus size={14} className="inline mr-1" />
              Add Row
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-2 px-2 text-xs uppercase tracking-widest text-gray-500 font-bold">
                    Service
                  </th>
                  <th className="text-left py-2 px-2 text-xs uppercase tracking-widest text-gray-500 font-bold">
                    Description
                  </th>
                  <th className="text-center py-2 px-2 text-xs uppercase tracking-widest text-gray-500 font-bold">
                    Qty
                  </th>
                  <th className="text-right py-2 px-2 text-xs uppercase tracking-widest text-gray-500 font-bold">
                    Rate (₹)
                  </th>
                  <th className="text-center py-2 px-2 text-xs uppercase tracking-widest text-gray-500 font-bold">
                    Disc %
                  </th>
                  <th className="text-right py-2 px-2 text-xs uppercase tracking-widest text-gray-500 font-bold">
                    Total
                  </th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.services.map((service) => {
                  const total = service.quantity * service.unitPrice * (1 - service.discount / 100);
                  return (
                    <tr key={service.id} className="group">
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => updateService(service.id, 'name', e.target.value)}
                          placeholder="Service name"
                          className="w-full border h-8 px-2 text-xs focus:outline-none focus:border-[#1a1a2e]"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={service.description}
                          onChange={(e) => updateService(service.id, 'description', e.target.value)}
                          placeholder="Brief description"
                          className="w-full border h-8 px-2 text-xs focus:outline-none focus:border-[#1a1a2e]"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={service.quantity}
                          onChange={(e) => updateService(service.id, 'quantity', parseFloat(e.target.value) || 1)}
                          min="1"
                          className="w-16 border h-8 px-2 text-xs text-center focus:outline-none focus:border-[#1a1a2e]"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={service.unitPrice}
                          onChange={(e) => updateService(service.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          className="w-24 border h-8 px-2 text-xs text-right focus:outline-none focus:border-[#1a1a2e]"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={service.discount}
                          onChange={(e) => updateService(service.id, 'discount', parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          className="w-16 border h-8 px-2 text-xs text-center focus:outline-none focus:border-[#1a1a2e]"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <span className="text-xs font-bold text-[#1a1a2e]">
                          ₹{total.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-2 px-1">
                        {data.services.length > 1 && (
                          <button
                            onClick={() => removeService(service.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t-2 border-[#1a1a2e]">
            <div className="flex justify-end">
              <div className="w-80 space-y-2 text-sm">
                {/* Services Subtotal */}
                <div className="flex justify-between text-gray-500">
                  <span className="uppercase text-xs tracking-widest font-bold">Services Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                
                {/* Add-ons */}
                {addOnsTotal > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span className="uppercase text-xs tracking-widest font-bold">Add-ons</span>
                    <span>₹{addOnsTotal.toLocaleString()}</span>
                  </div>
                )}
                
                {/* Overall Cost */}
                <div className="flex justify-between text-gray-700 font-semibold border-t pt-2">
                  <span className="uppercase text-xs tracking-widest font-bold">Overall Cost</span>
                  <span>₹{overallCost.toLocaleString()}</span>
                </div>
                
                {/* Discount */}
                <div className="flex justify-between text-gray-500 items-center">
                  <span className="uppercase text-xs tracking-widest font-bold">Discount</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={data.discount || 0}
                      onChange={(e) => updateData({ discount: parseFloat(e.target.value) || 0 })}
                      min="0"
                      placeholder="0"
                      className="w-24 px-2 py-1 border text-xs text-right focus:outline-none focus:border-[#1a1a2e]"
                    />
                    <span className="text-green-600 font-bold">
                      {data.discount > 0 ? `−₹${data.discount.toLocaleString()}` : '₹0'}
                    </span>
                  </div>
                </div>
                
                {/* Offered Price */}
                <div className="flex justify-between text-blue-700 font-bold border-t pt-2">
                  <span className="uppercase text-xs tracking-widest font-black">Offered Price</span>
                  <span className="text-base">₹{offeredPrice.toLocaleString()}</span>
                </div>
                
                {/* GST Toggle */}
                <div className="flex justify-between items-center border-t pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="gstToggle"
                      checked={gstEnabled}
                      onChange={(e) => {
                        setGstEnabled(e.target.checked);
                        if (!e.target.checked) {
                          updateData({ taxRate: 0 });
                        } else {
                          updateData({ taxRate: 18 });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <label htmlFor="gstToggle" className="uppercase text-xs tracking-widest font-bold text-gray-700 cursor-pointer">
                      Include GST
                    </label>
                  </div>
                  {gstEnabled && (
                    <input
                      type="number"
                      value={data.taxRate}
                      onChange={(e) => updateData({ taxRate: parseFloat(e.target.value) || 0 })}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-16 px-2 py-1 border text-xs text-right focus:outline-none focus:border-[#1a1a2e]"
                    />
                  )}
                </div>
                
                {/* GST Amount */}
                {gstEnabled && (
                  <div className="flex justify-between text-gray-500">
                    <span className="uppercase text-xs tracking-widest font-bold">
                      GST ({data.taxRate}%)
                    </span>
                    <span>₹{taxAmount.toLocaleString()}</span>
                  </div>
                )}
                
                {/* Final Quotation */}
                <div className="flex justify-between bg-[#1a1a2e] text-[#e8b86d] px-4 py-3 mt-2">
                  <span className="text-sm font-black uppercase tracking-widest">
                    Final Quotation
                  </span>
                  <span className="text-xl font-black">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="bg-white border-2 border-[#1a1a2e] p-5">
          <h3 className="font-black uppercase tracking-widest text-sm text-[#1a1a2e] mb-4 border-b-2 border-[#e8b86d] pb-2">
            💳 Payment Options
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 border-2 border-gray-200 hover:border-[#e8b86d] transition-colors">
              <input
                type="checkbox"
                id="razorpayEnabled"
                checked={data.razorpayEnabled || false}
                onChange={(e) => updateData({ razorpayEnabled: e.target.checked })}
                className="w-5 h-5"
              />
              <label htmlFor="razorpayEnabled" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <CreditCard size={20} className="text-[#1a1a2e]" />
                  <div>
                    <p className="font-black uppercase tracking-widest text-sm text-[#1a1a2e]">
                      Enable Online Payment
                    </p>
                    <p className="text-xs text-gray-500">
                      Allow clients to pay via Razorpay (Cards, UPI, Net Banking)
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {data.razorpayEnabled && (
              <div className="bg-emerald-50 border-2 border-emerald-200 p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={18} />
                  <div className="text-sm text-emerald-800">
                    <p className="font-bold mb-1">Online Payment Enabled ✓</p>
                    <p className="text-xs">
                      Clients will see a "Pay Now" button on the quotation page. They can pay using:
                    </p>
                    <ul className="text-xs mt-2 space-y-1 ml-4 list-disc">
                      <li>Credit/Debit Cards</li>
                      <li>UPI (Google Pay, PhonePe, Paytm)</li>
                      <li>Net Banking</li>
                      <li>Wallets</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border-2 border-blue-200 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-blue-800">
                  <p className="font-bold mb-1">Other Payment Methods</p>
                  <p className="text-xs">
                    Clients can also choose to pay via Cash, UPI transfer, or Bank transfer. These payments will need manual verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Payment Terms */}
        <div className="bg-white border-2 border-[#1a1a2e] p-5">
          <h3 className="font-black uppercase tracking-widest text-sm text-[#1a1a2e] mb-4 border-b-2 border-[#e8b86d] pb-2">
            Payment Terms & Notes
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                Payment Terms
              </label>
              <input
                type="text"
                value={data.paymentTerms || '50% advance, 50% on completion'}
                onChange={(e) => updateData({ paymentTerms: e.target.value })}
                placeholder="E.g., 50% advance, 50% on completion"
                className="w-full px-3 py-2 border-2 border-gray-200 text-sm focus:outline-none focus:border-[#1a1a2e]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                Payment Milestones (Optional)
              </label>
              <textarea
                value={data.paymentMilestones || ''}
                onChange={(e) => updateData({ paymentMilestones: e.target.value })}
                placeholder="E.g., Milestone 1: 30% on project kickoff&#10;Milestone 2: 40% on design approval&#10;Milestone 3: 30% on final delivery"
                className="w-full px-3 py-2 border-2 border-gray-200 text-sm focus:outline-none focus:border-[#1a1a2e] resize-none"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                Additional Notes
              </label>
              <textarea
                value={data.notes || ''}
                onChange={(e) => updateData({ notes: e.target.value })}
                placeholder="Special conditions, delivery timeline, warranty information..."
                className="w-full px-3 py-2 border-2 border-gray-200 text-sm focus:outline-none focus:border-[#1a1a2e] resize-none"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Free Revision Notice */}
        <div className="bg-amber-50 border-2 border-[#e8b86d] p-4 flex items-start gap-3">
          <AlertCircle className="text-[#e8b86d] flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> Includes 3 minor revisions free of cost. Additional revisions or major scope changes may incur extra charges.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSaveAndPreview}
          disabled={loading}
          className="w-full bg-[#1a1a2e] text-[#e8b86d] hover:bg-[#e8b86d] hover:text-[#1a1a2e] font-black uppercase tracking-widest border-2 border-[#1a1a2e] py-6 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              {data._id ? 'Updating Quotation...' : 'Creating Quotation...'}
            </>
          ) : (
            <>
              <Check size={20} />
              {data._id ? 'Update & Preview Document →' : 'Save & Preview Document →'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
