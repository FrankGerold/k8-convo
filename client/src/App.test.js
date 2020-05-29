import ReactDOM from 'react-dom';
import React from 'react';
import { render } from '@testing-library/react';
import App from './App';


it('Bullshit test for CD demo purposes', () => {});

test('renders k8 title edit', () => {
  const { getByText } = render(<App />);
  const codeElement = getByText(/Kubernetes/i);
  expect(codeElement).toBeInTheDocument();
});
