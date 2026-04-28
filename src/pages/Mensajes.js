import { useState, useRef } from 'react';
import { MessageCircle, Send, ShoppingCart, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import { useMensajes } from '../context/MensajesContext';
import { formatCOP } from '../utils/formatters';

const CONVERSACIONES_MOCK = [
  {
    id: 1,
    nombre: 'Valentina Ospina',
    telefono: '3201234567',
    avatar: 'VO',
    ultimoMensaje: 'Para llevar 2 latte y 3 almojábanas',
    hora: '14:32',
    noLeidos: 2,
    mensajes: [
      { id: 1, de: 'cliente', texto: 'Buenas tardes, ¿tienen para llevar?', hora: '14:28' },
      { id: 2, de: 'negocio', texto: 'Sí claro, ¿en qué le podemos ayudar?', hora: '14:29' },
      { id: 3, de: 'cliente', texto: 'Quiero hacer un pedido para llevar', hora: '14:30' },
      { id: 4, de: 'cliente', texto: 'Para llevar 2 latte y 3 almojábanas', hora: '14:32' },
    ],
    orden: [
      { nombre: 'Latte', cantidad: 2, precio: 8200 },
      { nombre: 'Almojábana', cantidad: 3, precio: 2500 },
    ],
  },
  {
    id: 2,
    nombre: 'Carlos Andrade',
    telefono: '3109876543',
    avatar: 'CA',
    ultimoMensaje: '¿Cuánto demora el pedido?',
    hora: '13:15',
    noLeidos: 0,
    mensajes: [
      { id: 1, de: 'cliente', texto: '¡Hola! ¿Me preparan un capuchino doble?', hora: '13:10' },
      { id: 2, de: 'negocio', texto: 'Con mucho gusto, ¿para recoger o domicilio?', hora: '13:11' },
      { id: 3, de: 'cliente', texto: 'Para recoger, ya voy para allá', hora: '13:12' },
      { id: 4, de: 'negocio', texto: '¡Listo! Lo tenemos en 5 minutos', hora: '13:13' },
      { id: 5, de: 'cliente', texto: '¿Cuánto demora el pedido?', hora: '13:15' },
    ],
    orden: [
      { nombre: 'Capuchino doble', cantidad: 1, precio: 9500 },
    ],
  },
  {
    id: 3,
    nombre: 'María Fernanda Ríos',
    telefono: '3156543210',
    avatar: 'MR',
    ultimoMensaje: 'Muchas gracias, quedamos así',
    hora: 'Ayer',
    noLeidos: 0,
    mensajes: [
      { id: 1, de: 'cliente', texto: 'Buenas, ¿tienen torta de chocolate hoy?', hora: 'Ayer 18:20' },
      { id: 2, de: 'negocio', texto: 'Sí tenemos, ¿cuántas porciones desea?', hora: 'Ayer 18:22' },
      { id: 3, de: 'cliente', texto: 'Me da 2 porciones y un tinto', hora: 'Ayer 18:23' },
      { id: 4, de: 'negocio', texto: 'Perfecto, lista la orden para recoger', hora: 'Ayer 18:25' },
      { id: 5, de: 'cliente', texto: 'Muchas gracias, quedamos así', hora: 'Ayer 18:26' },
    ],
    orden: [
      { nombre: 'Torta de chocolate', cantidad: 2, precio: 5500 },
      { nombre: 'Tinto', cantidad: 1, precio: 2500 },
    ],
  },
];

const PREVIEW_CARDS = [
  {
    emoji: '📱',
    titulo: 'Recibe pedidos por WhatsApp',
    desc: 'Tus clientes piden sin llamar ni ir al local',
  },
  {
    emoji: '🤖',
    titulo: 'Bot inteligente 24/7',
    desc: 'Responde automáticamente y toma la orden',
  },
  {
    emoji: '🍽️',
    titulo: 'Directo a cocina',
    desc: 'La orden llega al POS sin que hagas nada',
  },
];

function toastProximamente() {
  toast('Esta función estará disponible muy pronto 🚀', {
    style: { background: '#1A1713', color: '#E4B878', border: '1px solid rgba(200,144,63,0.3)' },
  });
}

export default function Mensajes() {
  const { markAllRead }   = useMensajes();
  const [activa]          = useState(CONVERSACIONES_MOCK[0].id);
  const mensajesRef       = useRef(null);

  // markAllRead al montar (sin efectos de navegación — es solo preview)
  useState(() => { markAllRead(); });

  const convActiva  = CONVERSACIONES_MOCK.find(c => c.id === activa);
  const totalOrden  = convActiva
    ? convActiva.orden.reduce((s, i) => s + i.precio * i.cantidad, 0)
    : 0;

  return (
    <div className="h-screen bg-mezo-ink flex flex-col overflow-hidden">
      <Navbar />

      {/* ─── Banner próximamente ─── */}
      <div className="flex-shrink-0 px-6 py-3 flex items-center gap-3"
        style={{ background: 'linear-gradient(90deg, rgba(200,144,63,0.12) 0%, rgba(200,144,63,0.06) 100%)', borderBottom: '1px solid rgba(200,144,63,0.2)' }}>
        <span style={{ fontSize: 20 }}>✨</span>
        <div>
          <p className="font-body font-semibold text-sm" style={{ color: '#E4B878' }}>
            Próximamente — Esta función está en desarrollo
          </p>
          <p className="font-body text-xs mt-0.5" style={{ color: '#A89880' }}>
            Pronto podrás recibir pedidos por WhatsApp directamente en mezo. Tu bot personal tomará los pedidos y los enviará a cocina solo.
          </p>
        </div>
      </div>

      {/* ─── Cards de preview ─── */}
      <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-b border-mezo-ink-line">
        {PREVIEW_CARDS.map(card => (
          <div key={card.titulo}
            className="flex-1 flex items-start gap-3 px-4 py-3 rounded-mezo-lg border"
            style={{ background: 'rgba(200,144,63,0.05)', borderColor: 'rgba(200,144,63,0.18)' }}>
            <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{card.emoji}</span>
            <div>
              <p className="font-body font-semibold text-sm" style={{ color: '#F4ECD8' }}>{card.titulo}</p>
              <p className="font-body text-xs mt-0.5" style={{ color: '#7A6A58', lineHeight: 1.5 }}>{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── UI de conversaciones — solo visual, sin interacción ─── */}
      <main className="flex-1 flex overflow-hidden relative">

        {/* Overlay invisible que captura todos los clicks y muestra toast */}
        <div
          className="absolute inset-0 z-20 cursor-default"
          style={{ background: 'transparent' }}
          onClick={toastProximamente}
        />

        {/* Contenido con opacidad reducida */}
        <div className="flex-1 flex overflow-hidden" style={{ opacity: 0.45, pointerEvents: 'none' }}>

          {/* Lista de conversaciones */}
          <div className="w-72 xl:w-80 flex-shrink-0 border-r border-mezo-ink-line flex flex-col">
            <div className="px-5 py-4 border-b border-mezo-ink-line flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} className="text-mezo-gold" />
                <h2 className="text-mezo-cream font-body font-semibold text-base">Mensajes</h2>
              </div>
              <p className="text-mezo-stone font-body text-xs mt-0.5">
                WhatsApp Business · Próximamente
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {CONVERSACIONES_MOCK.map(conv => (
                <div
                  key={conv.id}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-mezo-ink-line text-left
                    ${conv.id === activa ? 'bg-mezo-ink-raised' : ''}`}>

                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm"
                    style={{ background: 'rgba(200,144,63,0.14)', color: '#C8903F', border: '1px solid rgba(200,144,63,0.3)', fontFamily: 'monospace' }}>
                    {conv.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-mezo-cream font-body font-semibold text-sm truncate">{conv.nombre}</span>
                      <span className="text-mezo-stone font-body flex-shrink-0 ml-2" style={{ fontSize: 11 }}>{conv.hora}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-mezo-stone font-body text-xs truncate">{conv.ultimoMensaje}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat activo */}
          {convActiva && (
            <div className="flex-1 flex flex-col overflow-hidden">

              {/* Header del chat */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-mezo-ink-line flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ background: 'rgba(200,144,63,0.14)', color: '#C8903F', fontFamily: 'monospace' }}>
                    {convActiva.avatar}
                  </div>
                  <div>
                    <p className="text-mezo-cream font-body font-semibold text-sm">{convActiva.nombre}</p>
                    <p className="text-mezo-stone font-body" style={{ fontSize: 11 }}>{convActiva.telefono}</p>
                  </div>
                </div>

                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-mezo-md text-sm font-body font-semibold"
                  style={{ background: 'rgba(200,144,63,0.15)', color: '#C8903F', border: '1px solid rgba(200,144,63,0.4)' }}>
                  <ShoppingCart size={14} />
                  Convertir en orden
                </button>
              </div>

              {/* Mensajes */}
              <div ref={mensajesRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {convActiva.mensajes.map(msg => (
                  <div key={msg.id} className={`flex ${msg.de === 'negocio' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[70%]">
                      <div
                        className="px-4 py-2.5 font-body text-sm"
                        style={msg.de === 'negocio'
                          ? { background: 'rgba(200,144,63,0.18)', color: '#F4ECD8', borderRadius: '16px 16px 4px 16px' }
                          : { background: '#1A1713', border: '1px solid #2A2520', color: '#D9CEB5', borderRadius: '16px 16px 16px 4px' }}>
                        {msg.texto}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 ${msg.de === 'negocio' ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-mezo-stone font-body" style={{ fontSize: 10 }}>{msg.hora}</span>
                        {msg.de === 'negocio' && <CheckCheck size={11} className="text-mezo-stone" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen del pedido detectado */}
              {convActiva.orden.length > 0 && (
                <div className="px-6 py-3 border-t border-mezo-ink-line flex-shrink-0"
                  style={{ background: 'rgba(200,144,63,0.04)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-mezo-stone font-body text-xs uppercase tracking-widest">Pedido detectado</p>
                    <span className="text-mezo-gold font-mono font-bold text-sm">{formatCOP(totalOrden)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {convActiva.orden.map((item, i) => (
                      <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-mezo-sm font-body text-xs"
                        style={{ background: 'rgba(200,144,63,0.1)', color: '#E4B878', border: '1px solid rgba(200,144,63,0.25)' }}>
                        {item.cantidad}× {item.nombre} · {formatCOP(item.precio)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Input de respuesta */}
              <div className="px-6 py-3 border-t border-mezo-ink-line flex items-center gap-3 flex-shrink-0">
                <input
                  readOnly
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-lg text-sm font-body"
                />
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-mezo-lg opacity-40"
                  style={{ background: '#C8903F', color: '#080706' }}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
