
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">Página no encontrada</p>
      <p className="text-gray-500 max-w-md text-center mb-8">
        Lo sentimos, la página que está buscando no existe o ha sido movida.
      </p>
      <Link to="/">
        <Button>Volver al Inicio</Button>
      </Link>
    </div>
  );
};

export default NotFound;
