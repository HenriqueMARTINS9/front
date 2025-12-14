import React from 'react';


export default function Header({ title }: { title: string; }) {
    return (
        <div className='headerTitle'>
            <h1>{title}</h1>
        </div>
    );
}