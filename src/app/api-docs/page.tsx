'use client'

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch('/api-docs/swagger.json')
      .then((res) => res.json())
      .then((data) => setSpec(data));
  }, []);

  return (
    <section className="container">
      {spec && <SwaggerUI spec={spec} />}
    </section>
  );
}
