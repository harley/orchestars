import React from 'react'

const TermCondition = ({ termCondition }: { termCondition: string }) => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-gray-700 to-gray-950 bg-clip-text text-transparent">
            Điều Khoản và Chính Sách
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-950 to-gray-700 mx-auto mt-4 rounded-full" />
        </div>

        <div className=" mx-auto">
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
            <pre
              dangerouslySetInnerHTML={{ __html: termCondition }}
              className="whitespace-pre-wrap font-montserrat"
            ></pre>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TermCondition
