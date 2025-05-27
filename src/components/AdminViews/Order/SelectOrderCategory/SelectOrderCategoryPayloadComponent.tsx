'use client'

import { SelectInput, TextInput, useField } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

export const SelectOrderCategory = ({ ...props }: { path: string }) => {
  const options = [
    {
      label: 'Order Gift',
      value: 'order_gift',
    },
    {
      label: 'Order Payment',
      value: 'order_payment',
    },
    {
      label: 'Other',
      value: 'other',
    },
  ]
  const orderCategoryField = useField({ path: props.path })
  const [otherCategory, setOtherCategory] = useState('')
  const [tempOrderCategory, setTempOrderCategory] = useState('')

  useEffect(() => {
    const orderCategoryValue = orderCategoryField.value as string

    if (orderCategoryValue && !['order_gift', 'order_payment'].includes(orderCategoryValue)) {
      setTempOrderCategory('other')
      setOtherCategory(orderCategoryValue)
    } else {
      setTempOrderCategory(orderCategoryValue)
    }

    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (tempOrderCategory == 'other') {
      orderCategoryField.setValue(otherCategory)
    }
  }, [tempOrderCategory, otherCategory, orderCategoryField])

  return (
    <div className="field-type">
      <label htmlFor="" className="field-label">
        Order Category
      </label>
      <div>
        <SelectInput
          path={props.path}
          options={options}
          value={tempOrderCategory as string}
          name="category"
          onChange={(option) => {
            const value = (option as any).value
            orderCategoryField.setValue(value)
            setTempOrderCategory(value)
          }}
        />
        {tempOrderCategory === 'other' && (
          <TextInput
            style={{ marginTop: 12 }}
            path="otherCategory"
            placeholder="Enter your other order category"
            value={otherCategory}
            onChange={(e: any) => {
              setOtherCategory(e.target.value)
              orderCategoryField.setValue(e.target.value as string)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default SelectOrderCategory
