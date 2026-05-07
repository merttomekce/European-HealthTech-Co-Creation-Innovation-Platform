import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'countries' or 'cities'
  const countryCode = searchParams.get('countryCode');

  // Using a highly reliable public API (Geonames/RestCountries fallback)
  // For cities, we'll use a specific API that doesn't require complex keys for small volume
  
  if (type === 'countries') {
    try {
      const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flag');
      const data = await res.json();
      const countries = data
        .map((c: any) => ({
          value: c.name.common,
          label: c.name.common,
          code: c.cca2
        }))
        .sort((a: any, b: any) => a.value.localeCompare(b.value));
      
      return NextResponse.json(countries);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 });
    }
  }

  if (type === 'cities' && countryCode) {
    try {
      // Use CountriesNow API - very comprehensive and public
      const res = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: countryCode })
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.msg);

      const cities = data.data.map((city: string) => ({
        value: city,
        label: city
      }));

      return NextResponse.json(cities);
    } catch (error) {
      console.error('City fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
