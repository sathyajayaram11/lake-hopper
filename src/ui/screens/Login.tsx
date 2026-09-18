import { useState, type ReactElement } from 'react';
import { eventBus } from '../../core/events/bus';

export function Login(): ReactElement {
  const [name, setName] = useState('');
  const [section, setSection] = useState('');

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedSection = section.trim();
    if (!trimmedName || !trimmedSection) return;
    eventBus.emit('LoginSubmitted', { name: trimmedName, section: trimmedSection });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>You didn't sign.</h1>
      <label>
        Name
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>
        Section
        <input value={section} onChange={(event) => setSection(event.target.value)} />
      </label>
      <button type="submit">Continue</button>
    </form>
  );
}
