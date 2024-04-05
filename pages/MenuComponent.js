// MenuComponent.js
import React from "react"

const MenuComponent = ({ menuOpen, toggleMenu }) => {
  return (
    <>
      {menuOpen && (
        <div className="fixed bg-black opacity-50" onClick={toggleMenu}></div>
      )}
      <div
        className={`transform fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white transition-transform ease-in-out duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="py-4 px-6">
          <h1 className="text-xl font-bold mb-4">Menü Başlığı</h1>
          <ul>
            <li>
              <a href="#" className="block py-2">
                Menü Öğesi 1
              </a>
            </li>
            <li>
              <a href="#" className="block py-2">
                Menü Öğesi 2
              </a>
            </li>
            <li>
              <a href="#" className="block py-2">
                Menü Öğesi 3
              </a>
            </li>
            <li>
              <a href="#" className="block py-2">
                Menü Öğesi 4
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}

export default MenuComponent
