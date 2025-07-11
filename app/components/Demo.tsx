"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

const chatMessages = [
  { type: "user", message: "¿Este plato tiene gluten?" },
  { type: "bot", message: "El Risotto de Champiñones no contiene gluten en sus ingredientes principales. Sin embargo, recomiendo confirmar con el personal ya que podría haber contaminación cruzada en la cocina." },
  { type: "user", message: "What about dairy?" },
  { type: "bot", message: "The Mushroom Risotto contains dairy products including butter, heavy cream, and Parmesan cheese. If you need a dairy-free option, I'd recommend asking if they can prepare it with olive oil instead." },
]

export function Demo() {
  return (
    <section id="demo" className="py-24 lg:py-32 bg-timberwolf/30">
      <div className="mx-auto max-w-container-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-eerie-black mb-6">
              See <span className="font-black"><span className="font-serif">C</span>uli</span> in action
            </h2>
            <p className="text-lg text-eerie-black/80 mb-8">
              Watch how <span className="font-black"><span className="font-serif">C</span>uli</span> seamlessly handles multilingual conversations, providing accurate information about your menu items, allergens, and dietary restrictions.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-spanish-orange/20 flex items-center justify-center flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-spanish-orange" />
                </div>
                <p className="text-eerie-black/80">
                  Instant responses in the guest&apos;s preferred language
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-spanish-orange/20 flex items-center justify-center flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-spanish-orange" />
                </div>
                <p className="text-eerie-black/80">
                  Detailed allergen and dietary information
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-spanish-orange/20 flex items-center justify-center flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-spanish-orange" />
                </div>
                <p className="text-eerie-black/80">
                  Natural conversation flow that feels human
                </p>
              </div>
            </div>
            <div className="mt-8">
              <Button size="lg">Try Live Demo</Button>
            </div>
          </motion.div>

          {/* Right side - Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="mx-auto max-w-container-narrow">
              {/* Phone frame */}
              <div className="relative bg-eerie-black rounded-[2.5rem] p-3 shadow-2xl">
                <div className="bg-white rounded-[2rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="bg-white px-6 py-2 flex items-center justify-between text-xs text-eerie-black">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-3 bg-eerie-black rounded-sm" />
                      <div className="w-4 h-3 bg-eerie-black rounded-sm" />
                      <div className="w-4 h-3 bg-eerie-black rounded-sm" />
                    </div>
                  </div>

                  {/* Chat interface */}
                  <div className="bg-seasalt h-[600px] p-4">
                    <div className="bg-white rounded-t-2xl h-full shadow-sm">
                      {/* Chat header */}
                      <div className="border-b border-cinereous/10 p-4">
                        <h3 className="font-semibold text-eerie-black"><span className="font-black"><span className="font-serif">C</span>uli</span> Assistant</h3>
                        <p className="text-xs text-cinereous">Restaurant TableLink</p>
                      </div>

                      {/* Chat messages */}
                      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-120px)]">
                        {chatMessages.map((msg, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: index * 0.2 }}
                            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                msg.type === "user"
                                  ? "bg-spanish-orange text-white"
                                  : "bg-timberwolf text-eerie-black"
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Input area */}
                      <div className="border-t border-cinereous/10 p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Ask about the menu..."
                            className="flex-1 rounded-full border border-cinereous/20 px-4 py-2 text-sm focus:outline-none focus:border-spanish-orange"
                            readOnly
                          />
                          <button className="h-8 w-8 rounded-full bg-spanish-orange text-white flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}