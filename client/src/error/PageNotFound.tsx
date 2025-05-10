import React from 'react';
import { useNavigate } from 'react-router-dom';

const PageNotFound: React.FC = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        setTimeout(() => {
            navigate('/');
        }, 3000);
    }, [navigate]);

    return null;
};

export default PageNotFound;
