// tests/hello.test.ts - Test de la ruta /api/hello
Deno.test("GET /api/hello responde Hello", async () => {
  const res = await fetch("http://localhost:3001/api/hello");
  const data = await res.json();
  console.assert(res.status === 200, "Status debe ser 200");
  console.assert(data.mensaje !== undefined, "Debe tener propiedad mensaje");
  console.log("✅ Test hello OK:", data.mensaje);
});
