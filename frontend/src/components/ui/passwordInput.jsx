import React, { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const PasswordInput = ({ value, onChange, name, placeholder = "Enter password", className, ...props }) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className={cn("relative w-full", className)}>
      <Input
        type="text" // We keep the input type as text
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="new-password"
        // Use the CSS property to mask the text when not visible.
        style={{ WebkitTextSecurity: visible ? "none" : "disc" }}
        className={cn("pr-10", props.className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible(prev => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground focus:outline-none"
        tabIndex={-1}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

export default PasswordInput
